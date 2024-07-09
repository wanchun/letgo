import path from 'node:path';
import process from 'node:process';
import { outputFileSync, readJsonSync } from 'fs-extra/esm';

const pkgs = ['renderer', 'components'];

pkgs.forEach((pkgName) => {
    const pkgPath = path.resolve(process.cwd(), `packages/${pkgName}/package.json`);
    const pkg = readJsonSync(pkgPath);
    const version = pkg.version;

    const fileText = `// 自动生成
export const version = '${version}';
    `;

    const outputPath = path.join(process.cwd(), `packages/${pkgName}/src/version.ts`);
    outputFileSync(outputPath, fileText);
});
