/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
const glob = require('fast-glob');
const { Project } = require('ts-morph');
const { getNeedCompilePkg } = require('./build-shard');

async function genPkgType(pkg) {
    // 这部分内容具体可以查阅 ts-morph 的文档
    // 这里仅需要知道这是用来处理 ts 文件并生成类型声明文件即可
    const project = new Project({
        compilerOptions: {
            declaration: true,
            emitDeclarationOnly: true,
            noEmitOnError: false,
            noImplicitAny: false,
            allowJs: true, // 如果想兼容 js 语法需要加上
            // outDir: 'types', // 可以设置自定义的打包文件夹，如 'types'
        },
        tsConfigFilePath: path.resolve(
            __dirname,
            `../packages/${pkg}/tsconfig.json`,
        ),
        skipAddingFilesFromTsConfig: true,
    });

    // 获取 src 下的 .vue 和 .ts 文件
    const files = await glob([
        `packages/${pkg}/src/**/*.ts`,
        `packages/${pkg}/src/**/*.tsx`,
    ]);
    const sourceFiles = [];

    sourceFiles.push(
        project.addSourceFileAtPath(path.resolve(__dirname, '../modules.d.ts')),
    );

    await Promise.all(
        files.map(async (file) => {
            sourceFiles.push(project.addSourceFileAtPath(file));
        }),
    );

    const diagnostics = project.getPreEmitDiagnostics();

    // 输出解析过程中的错误信息
    console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));

    project.emitToMemory();

    // 随后将解析完的文件写道打包路径
    for (const sourceFile of sourceFiles) {
        const emitOutput = sourceFile.getEmitOutput();

        for (const outputFile of emitOutput.getOutputFiles()) {
            const filePath = outputFile.getFilePath().replace('/es/src', '/es');

            await fs.promises.mkdir(path.dirname(filePath), {
                recursive: true,
            });
            await fs.promises.writeFile(filePath, outputFile.getText(), 'utf8');
        }
    }
}

async function main() {
    const pkgs = getNeedCompilePkg();
    for (const pkg of pkgs) {
        await genPkgType(pkg);
    }
}

main();
