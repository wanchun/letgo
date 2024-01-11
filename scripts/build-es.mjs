import { basename, extname, join } from 'node:path';
import { copyFileSync, lstatSync, readdirSync } from 'node:fs';
import fse from 'fs-extra';
import { build } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import dts from 'vite-plugin-dts';
import pc from 'picocolors';
import enginePkg from '../packages/engine/package.json' assert { type: 'json' };
import {
    getEsOutputPath,
    getNeedCompileEsPkg,
    getResourcePath,
    includeTypeInBuild,
} from './build-shard.mjs';
import { inlineToExtract } from './inject-css.mjs';

function isEntryFile(filePath) {
    const fileName = filePath.split('src/')[1];
    return ['index.ts', 'index.tsx'].includes(fileName);
}

function getTsConfigPath(filePath) {
    if (isEntryFile(filePath) && includeTypeInBuild())
        return join(filePath.split('src/')[0], 'tsconfig.json');

    return null;
}

async function buildFile(filePath, outputDir) {
    const tsConfigPath = getTsConfigPath(filePath);
    const startTime = Date.now();
    await build({
        base: './',
        define: {
            ENGINE_VERSION_PLACEHOLDER: JSON.stringify(enginePkg.version),
            ENGINE_EXT_VERSION_PLACEHOLDER: JSON.stringify(enginePkg.version),
        },
        plugins: [vue(), vueJsx(), tsConfigPath
            ? dts({
                compilerOptions: {
                    rootDir: join(filePath.split('src')[0], 'src'),
                },
                tsconfigPath: tsConfigPath,
            })
            : null],
        build: {
            outDir: outputDir,
            assetsDir: '.',
            minify: false,
            emptyOutDir: false,
            cssCodeSplit: true,
            lib: {
                entry: filePath,
                fileName: () => {
                    return basename(filePath).replace(/\.tsx?$/, '.js');
                },
                formats: ['es'],
            },
            rollupOptions: {
                external: (id) => {
                    id = id.split('?')[0];
                    if (id.includes(filePath))
                        return false;

                    if ((id.endsWith('.css')
                        || id.endsWith('.less')) && !id.startsWith('..'))
                        return false;

                    return true;
                },
                plugins: [inlineToExtract()],
                output: {
                    preserveModules: true,
                    assetFileNames: (assetInfo) => {
                        if (assetInfo.name === 'style.css')
                            return basename(filePath).replace(/\.tsx?$/, '.css');
                        return assetInfo.name;
                    },
                },
            },
        },
        logLevel: 'warn',
    });
    const endTime = Date.now();
    console.log(
        pc.blue(`🎉 packages${filePath.split('/packages')[1]}`),
        ' ',
        pc.green(`built in ${endTime - startTime}ms`),
    );
}

export async function compilerFile(filePath, outputDir) {
    const fileExt = extname(filePath);
    const fileName = basename(filePath);
    if (['.ts', '.tsx'].includes(fileExt))
        await buildFile(filePath, outputDir);

    else if (fileExt === '.json')
        copyFileSync(filePath, join(outputDir, fileName));
}

async function compilerFiles(source, outputDir) {
    const files = readdirSync(source);
    for (const file of files) {
        if (!/__tests__/.test(file) && !/tests/.test(file) && !/demos/.test(file)) {
            const filePath = join(source, file);
            const stats = lstatSync(filePath);
            if (stats.isDirectory(filePath) && !/__tests__/.test(file) && !/tests/.test(file))
                await compilerFiles(filePath, join(outputDir, file));

            else if (stats.isFile(filePath))
                await compilerFile(filePath, outputDir);
        }
    }
}

export async function compilePkg(pkg, emptyOutDir = true) {
    const outputDir = getEsOutputPath(pkg);
    const source = getResourcePath(pkg);
    if (emptyOutDir)
        fse.removeSync(outputDir);

    await compilerFiles(source, outputDir);
}

async function compilePkgs(pkgs) {
    for (const pkg of pkgs)
        await compilePkg(pkg);
}

export async function buildEsm() {
    const pkgs = getNeedCompileEsPkg();
    await compilePkgs(pkgs);
}
