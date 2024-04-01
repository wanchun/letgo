import path from 'node:path';
import fs from 'node:fs';
import process from 'node:process';
import pkg from '../packages/components/package.json' assert { type: 'json' };

const version = pkg.version;

const fileText = `// 自动生成
export const version = '${version}';
`;

const filePath = path.join(process.cwd(), 'packages/components/src/version.ts');

fs.writeFile(filePath, fileText, (err) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(`${filePath} 写入成功`);
});
