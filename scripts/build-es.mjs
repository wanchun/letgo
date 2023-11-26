import { basename, extname, join } from 'node:path'
import { copyFileSync, lstatSync, readdirSync } from 'node:fs'
import { build } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import dts from 'vite-plugin-dts'
import enginePkg from '../packages/engine/package.json' assert { type: 'json' }
import {
    getEsOutputPath,
    getNeedCompileEsPkg,
    getResourcePath,
    includeTypeInBuild,
} from './build-shard.mjs'
import { inlineToExtract } from './inject-css.mjs'

async function buildFile(filePath, outputDir, allEntry) {
    await build({
        define: {
            ENGINE_VERSION_PLACEHOLDER: enginePkg.version,
            ENGINE_EXT_VERSION_PLACEHOLDER: enginePkg.version,
        },
        plugins: [vue(), vueJsx(), vanillaExtractPlugin(), filePath === allEntry && includeTypeInBuild()
            ? dts({
                compilerOptions: {
                    rootDir: join(allEntry.split('src')[0], 'src'),
                },
            })
            : null],
        build: {
            outDir: outputDir,
            minify: false,
            emptyOutDir: false,
            lib: {
                entry: filePath,
                fileName: () => {
                    return basename(filePath).replace(/\.tsx?$/, '.js')
                },
                formats: ['es'],
            },
            rollupOptions: {
                external: (id) => {
                    id = id.split('?')[0]
                    if (
                        id.includes(filePath)
                        || id.endsWith('.css')
                        || id.endsWith('.css.ts')
                        || id.endsWith('vanilla.css')
                    )
                        return false

                    return true
                },
                plugins: [inlineToExtract()],
                output: {
                    assetFileNames: (assetInfo) => {
                        if (assetInfo.name === 'style.css')
                            return basename(filePath).replace(/\.tsx?$/, '.css')
                        return assetInfo.name
                    },
                },
            },
        },
    })
}

export async function compilerFile(filePath, outputDir, allEntry) {
    const fileExt = extname(filePath)
    const fileName = basename(filePath)
    if (
        ['.ts', '.tsx'].includes(fileExt)
        && !filePath.endsWith('.css.ts')
    )
        await buildFile(filePath, outputDir, allEntry)

    else if (fileExt === '.json')
        copyFileSync(filePath, join(outputDir, fileName))
}

async function compilerFiles(source, outputDir, allEntry) {
    const files = readdirSync(source)
    for (const file of files) {
        if (!/__tests__/.test(file) && !/tests/.test(file) && !/demos/.test(file)) {
            const filePath = join(source, file)
            const stats = lstatSync(filePath)
            if (stats.isDirectory(filePath) && !/__tests__/.test(file) && !/tests/.test(file))
                await compilerFiles(filePath, join(outputDir, file), allEntry)

            else if (stats.isFile(filePath))
                await compilerFile(filePath, outputDir, allEntry)
        }
    }
}

export async function compilePkg(pkg) {
    const outputDir = getEsOutputPath(pkg)
    const source = getResourcePath(pkg)
    const allEntry = join(source, 'index.ts')
    await compilerFiles(source, outputDir, allEntry)
}

async function compilePkgs(pkgs) {
    for (const pkg of pkgs)
        await compilePkg(pkg)
}

export async function buildEsm() {
    const pkgs = getNeedCompileEsPkg()
    await compilePkgs(pkgs)
}
