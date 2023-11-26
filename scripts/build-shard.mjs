import path from 'node:path'
import process from 'node:process'
import fse from 'fs-extra'

export const PACKAGE_PATH = path.join(process.cwd(), './packages')

export const extensions = ['.js', '.vue', '.jsx', '.json', '.ts', '.tsx']

export function getEsOutputPath(pkg) {
    return path.join(process.cwd(), 'packages', pkg, 'es')
}

export function getLibOutputPath(pkg) {
    return path.join(process.cwd(), 'packages', pkg, 'lib')
}

export function isWatch() {
    return process.argv.includes('--watch')
}

export function includeTypeInBuild() {
    return process.argv.includes('--types')
}

export function getResourcePath(pkg) {
    return path.join(process.cwd(), 'packages', pkg, 'src')
}

export function getNeedCompileEsPkg() {
    const pkgs = fse.readdirSync(PACKAGE_PATH)
    return pkgs.filter(
        item =>
            item !== '.DS_Store'
            && !item.startsWith('_')
            && ![
                'template',
                'simulator-renderer',
            ].includes(item),
    )
}

export function getNeedPubPkg() {
    const pkgs = fse.readdirSync(PACKAGE_PATH)
    return pkgs.filter(
        item =>
            item !== '.DS_Store'
            && !item.startsWith('_')
            && !['template'].includes(item),
    )
}

export function getOutputDirFromFilePath(filePath) {
    return path
        .dirname(filePath)
        .replace('/src', '/es')
        .replace('\\src', '\\es')
}

export function isFileChange(from, to) {
    if (fse.existsSync(to)) {
        const stats = fse.lstatSync(from)
        const toStats = fse.lstatSync(to)
        return toStats.mtime < stats.mtime
    }
    return true
}
