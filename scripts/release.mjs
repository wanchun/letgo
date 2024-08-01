import fs from 'node:fs';
import process from 'node:process';
import * as url from 'node:url';
import path, { join } from 'node:path';
import fse from 'fs-extra';
import minimist from 'minimist';
import pc from 'picocolors';
import semver from 'semver';
import enquirer from 'enquirer';
import { execa } from 'execa';

import { getBranchName } from './git.mjs';
import { getNeedPubPkg } from './build-shard.mjs';

const { prompt } = enquirer;
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const { preid: preId, dry: isDryRun } = minimist(process.argv.slice(2));
const packages = getNeedPubPkg();

const versionIncrements = ['patch', 'minor', 'major', 'prepatch', 'preminor', 'premajor', 'prerelease'];

const ROOT_PKG_PATH = join(process.cwd(), 'package.json');

const currentBranch = await getBranchName();

const isBeta = currentBranch.includes('beta') || currentBranch.includes('release-');

function incVersion(version, i) {
    let _preId = preId || semver.prerelease(version)?.[0];
    if (!_preId && (isBeta || /pre/.test(i)))
        _preId = 'beta';

    return semver.inc(version, i, _preId);
}
function autoIncVersion(version) {
    if (version.includes('-') || isBeta)
        return semver.inc(version, 'prerelease', 'beta');

    return semver.inc(version, 'patch');
}

const run = (bin, args, opts = {}) => execa(bin, args, { stdio: 'inherit', ...opts });
const dryRun = (bin, args, opts = {}) => console.log(pc.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts);
const runIfNotDry = isDryRun ? dryRun : run;
const getPkgRoot = pkg => path.resolve(__dirname, `../packages/${pkg}`);
const step = msg => console.log(pc.cyan(msg));
function arrToObj(arr, key) {
    return arr.reduce((acc, cur) => {
        acc[cur[key]] = cur;
        return acc;
    }, {});
}

async function publishPackage(pkg) {
    step(`Publishing ${pkg.name}...`);
    try {
        let _releaseTag;
        // if (pkg.newVersion.includes('-'))
        //     _releaseTag = 'next';

        await runIfNotDry(
            // note: use of pnpm is intentional here as we rely on its publishing
            // behavior.
            'wnpm',
            ['publish', ...(_releaseTag ? ['--tag', _releaseTag] : []), '--access', 'public', '--registry', 'http://wnpm.weoa.com:8001'],
            {
                cwd: getPkgRoot(pkg.dirName),
                stdio: 'pipe',
                env: {
                    npm_config_user_agent: 'npm/9.9.1 node/v20.9.0 darwin arm64 workspaces/false',
                },
            },
        );
        console.log('Successfully published:', pc.green(`${pkg.name}@${pkg.newVersion}`));
    }
    catch (e) {
        if (e.stderr.match(/previously published/))
            console.log(pc.red(`Skipping already published: ${pkg.name}`));

        else
            throw e;
    }
}

function readPackageJson(pkg) {
    const pkgPath = getPkgRoot(pkg);
    return JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json'), 'utf-8'));
}

function writePackageJson(pkg, content) {
    const pkgPath = getPkgRoot(pkg);
    fs.writeFileSync(path.join(pkgPath, 'package.json'), `${JSON.stringify(content, null, 4)}\n`);
}

function readPackageVersionAndName(pkg) {
    const { version, name } = readPackageJson(pkg);
    return {
        version,
        name,
    };
}

function updatePackage(pkgName, version, pkgs) {
    const pkgJson = readPackageJson(pkgName);
    pkgJson.version = version;
    pkgJson.dependencies
    && Object.keys(pkgJson.dependencies).forEach((npmName) => {
        if (pkgs[npmName])
            pkgJson.dependencies[npmName] = `^${pkgs[npmName].newVersion}`;
    });
    pkgJson.peerDependencies
    && Object.keys(pkgJson.peerDependencies).forEach((npmName) => {
        if (pkgs[npmName])
            pkgJson.peerDependencies[npmName] = `^${pkgs[npmName].newVersion}`;
    });
    writePackageJson(pkgName, pkgJson);
}

function updateRootVersion(newRootVersion) {
    const pkg = fse.readJsonSync(ROOT_PKG_PATH);
    pkg.version = newRootVersion;
    fs.writeFileSync(ROOT_PKG_PATH, `${JSON.stringify(pkg, null, 4)}\n`);
}

function getRootVersion() {
    const pkg = fse.readJsonSync(ROOT_PKG_PATH);
    return pkg.version;
}

function updateVersions(packagesVersion) {
    const pkgs = arrToObj(packagesVersion, 'name');
    packagesVersion.forEach(p => updatePackage(p.dirName, p.newVersion, pkgs));
}

async function isChangeInCurrentTag(pkg, newestTag) {
    const { stdout: pkgDiffContent } = await run('git', ['diff', newestTag, `packages/${pkg}`], { stdio: 'pipe' });
    return !!pkgDiffContent;
}

async function filterChangedPackages() {
    const { stdout: newestTag } = await run('git', ['describe', '--abbrev=0', '--tags'], { stdio: 'pipe' });

    const results = await Promise.all(
        packages.map(async (pkg) => {
            const result = await isChangeInCurrentTag(pkg, newestTag);
            return result;
        }),
    );

    return packages.filter((_v, index) => results[index]);
}

async function createPackageNewVersion(name, version) {
    // no explicit version, offer suggestions
    const { release } = await prompt({
        type: 'select',
        name: 'release',
        message: `Select release type: ${name}`,
        choices: versionIncrements.map(i => `${i} (${incVersion(version, i)})`).concat(['custom']),
    });

    let newVersion;
    if (release === 'custom') {
        newVersion = (
            await prompt({
                type: 'input',
                name: 'version',
                message: `Input custom version: ${name}`,
                initial: version,
            })
        ).version;
    }
    else {
        newVersion = release.match(/\((.*)\)/)[1];
    }

    if (!semver.valid(newVersion)) {
        console.log(`invalid target version: ${newVersion}, please again.`);
        return createPackageNewVersion(name, version);
    }

    return newVersion;
}

async function genRootPackageVersion() {
    const pkg = fse.readJsonSync(ROOT_PKG_PATH);
    const newVersion = await createPackageNewVersion(pkg.name, pkg.version);
    return newVersion;
}

function genOtherPkgsVersion(packagesVersion) {
    const noChangedPkgs = packages.filter(name => !packagesVersion.find(item => item.dirName === name));
    const pkgs = arrToObj(packagesVersion, 'name');
    const result = [];
    noChangedPkgs.forEach((currentPkg) => {
        const pkgJson = readPackageJson(currentPkg);
        let isUpdated = false;

        if (pkgJson.dependencies) {
            Object.keys(pkgJson.dependencies).forEach((npmName) => {
                if (pkgs[npmName]) {
                    isUpdated = true;
                    pkgJson.dependencies[npmName] = `^${pkgs[npmName].newVersion}`;
                }
            });
        }

        if (isUpdated) {
            const oldVersion = pkgJson.version;
            pkgJson.version = autoIncVersion(oldVersion);
            result.push({
                dirName: currentPkg,
                version: oldVersion,
                newVersion: pkgJson.version,
                name: pkgJson.name,
            });
            writePackageJson(currentPkg, pkgJson);
        }
    });

    return result;
}

const NEED_PUBLISH_PKGS = join(process.cwd(), '.temp', 'pub.json');
function rewordChangePkg(packagesVersion) {
    fse.outputJsonSync(NEED_PUBLISH_PKGS, packagesVersion);
}
function removeChangePkg() {
    fse.removeSync(NEED_PUBLISH_PKGS);
}

function readChangePkg() {
    if (fs.existsSync(NEED_PUBLISH_PKGS))
        return fse.readJsonSync(NEED_PUBLISH_PKGS);

    return null; ;
}

async function publishPkgs(packagesVersion) {
    rewordChangePkg(packagesVersion);

    for (const pkg of packagesVersion)
        await publishPackage(pkg);

    removeChangePkg();
}

async function main() {
    let packagesVersion = readChangePkg();
    let newRootVersion = getRootVersion();
    if (!packagesVersion) {
        const changedPackages = await filterChangedPackages();

        if (!changedPackages.length) {
            console.log(pc.yellow(`No changes to commit.`));
            return;
        }

        const updatedPkgs = [];
        for (const pkg of changedPackages) {
            const { name, version } = readPackageVersionAndName(pkg);
            const newVersion = await createPackageNewVersion(name, version);
            updatedPkgs.push({
                dirName: pkg,
                newVersion,
                ...readPackageVersionAndName(pkg),
            });
        }

        const passiveUpdatePkgs = genOtherPkgsVersion(updatedPkgs);
        packagesVersion = passiveUpdatePkgs.concat(updatedPkgs);

        const { yes } = await prompt({
            type: 'confirm',
            name: 'yes',
            message: `These packages will be released: \n${packagesVersion
            .map(pkg => `${pc.magenta(pkg.name)}: v${pkg.version} > ${pc.green(`v${pkg.newVersion}`)}`)
            .join('\n')}\nConfirm?`,
        });

        if (!yes)
            return;

        newRootVersion = await genRootPackageVersion();

        // update all package versions and inter-dependencies
        step('\nUpdating cross dependencies...');
        updateRootVersion(newRootVersion);
        updateVersions(packagesVersion);

        // update lock
        // await run('pnpm', ['i']);
        // // build all packages with types
        step('\nBuilding all packages...');
        if (!isDryRun)
            await run('pnpm', ['build']);

        else
            console.log(`(skipped build)`);

        // generate changelog
        step('\nGenerating changelog...');
        await run(`pnpm`, ['changelog']);

        const { stdout } = await run('git', ['diff'], { stdio: 'pipe' });
        if (stdout) {
            step('\nCommitting changes...');
            await runIfNotDry('git', ['add', '-A']);
            await runIfNotDry('git', ['commit', '-m', `chore: v${newRootVersion}`]);
        }
        else {
            console.log('No changes to commit.');
        }
    }

    // publish packages
    step('\nPublishing packages: ');
    await publishPkgs(packagesVersion);

    // push to GitHub
    step('\nPushing to GitHub...');
    await runIfNotDry('git', ['tag', `v${newRootVersion}`]);
    await runIfNotDry('git', ['push', 'origin', `refs/tags/v${newRootVersion}`]);
    await runIfNotDry('git', ['push']);

    if (isDryRun)
        console.log(`\nDry run finished - run git diff to see package changes.`);

    console.log();
}

main().catch((err) => {
    console.error(err);
});
