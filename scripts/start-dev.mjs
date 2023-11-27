import path from 'node:path';
import process from 'node:process';
import chalk from 'chalk';
import { Project } from 'ts-morph';
import { compilePkg, compilerFile } from './build-es.mjs';
import { getNeedCompileEsPkg, getOutputDirFromFilePath } from './build-shard.mjs';
import { watch } from './watch.mjs';
import { winPath } from './win-path.mjs';

async function genPkgType(pkg) {
    // 这部分内容具体可以查阅 ts-morph 的文档
    // 这里仅需要知道这是用来处理 ts 文件并生成类型声明文件即可
    const project = new Project({
        compilerOptions: {
            declaration: true,
            emitDeclarationOnly: true,
            skipLibCheck: true,
            noEmitOnError: false,
            noImplicitAny: false,
            allowJs: true, // 如果想兼容 js 语法需要加上
            // outDir: 'types', // 可以设置自定义的打包文件夹，如 'types'
        },
        tsConfigFilePath: path.resolve(
            process.cwd(),
            `packages/${pkg}/tsconfig.json`,
        ),
        skipAddingFilesFromTsConfig: true,
    });

    return {
        project,
        sourceFiles: {},
    };
}

function getPkgNameFormFilePath(filePath) {
    return winPath(filePath).split('packages/')[1].split('/')[0];
}

const projects = {};
async function getPkgsTypeProject() {
    const pkgs = getNeedCompileEsPkg();
    for (const pkg of pkgs)
        projects[pkg] = await genPkgType(pkg);
}

async function handleFileUpdateType(filePath) {
    const wFilePath = `packages${filePath.split('packages')[1]}`;

    const pkg = getPkgNameFormFilePath(filePath);

    const project = projects[pkg];

    let sourceFile = project.sourceFiles[wFilePath];
    if (sourceFile) {
        await sourceFile.refreshFromFileSystem();
    }
    else if (
        wFilePath.endsWith('.ts')
        || wFilePath.endsWith('.tsx')
    ) {
        sourceFile = project.project.addSourceFileAtPath(wFilePath);
        project.sourceFiles[wFilePath] = sourceFile;
    }
    try {
        if (sourceFile)
            await genType(sourceFile);
    }
    catch (e) {}
}

function handleFileRemoveType(filePath) {
    const dir = getOutputDirFromFilePath(filePath);
    fse.removeSync(`${dir}/${path.basename(filePath).replace(/\.tsx?/, '.d.ts')}`);
}

async function handleFileUpdateEs(filePath) {
    try {
        const pkg = getPkgNameFormFilePath(filePath);
        if (filePath.endsWith('.css.ts')) {
            await compilePkg(pkg);
        }
        else {
            await compilerFile(
                filePath,
                getOutputDirFromFilePath(filePath),
            );
        }

        const extname = path.extname(filePath);
        if (['.css', '.ts', '.tsx'].includes(extname)) {
            console.log(
                chalk.dim(winPath(filePath).split('/letgo')[1]),
                chalk.blue('updated'),
            );
        }
    }
    catch (err) {
        console.error(err);
    }
}

function handleFileRemoveEs(filePath) {
    const dir = getOutputDirFromFilePath(filePath);
    const extname = path.extname(filePath);
    if (extname === '.json')
        fse.removeSync(filePath);
    else if (filePath.endsWith('.css.ts'))
        fse.removeSync(`${filePath}.vanilla.css`);
    else if (['.ts', 'tsx'].includes(extname))
        fse.removeSync(`${dir}/${path.basename(filePath).replace(/\.tsx?/, '.js')}`);
}

async function startDev() {
    await getPkgsTypeProject();

    watch(async (filePath) => {
        handleFileUpdateEs(filePath);
        handleFileUpdateType(filePath);
    }, (filePath) => {
        handleFileRemoveType(filePath);
        handleFileRemoveEs(filePath);
    });
}

startDev();
