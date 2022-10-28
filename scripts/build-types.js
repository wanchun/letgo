/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
const glob = require('fast-glob');
const { Project } = require('ts-morph');
const { isWatch, isFileChange } = require('./build-shard');
const { watch } = require('./watch');

async function genType(sourceFile) {
    const emitOutput = sourceFile.getEmitOutput();

    for (const outputFile of emitOutput.getOutputFiles()) {
        const filePath = outputFile.getFilePath().replace('/es/src', '/es');

        await fs.promises.mkdir(path.dirname(filePath), {
            recursive: true,
        });
        await fs.promises.writeFile(filePath, outputFile.getText(), 'utf8');
    }
}

function isTypeChange(filePath) {
    const typePath = filePath.replace('src/', 'es/').replace('.ts', '.d.ts');
    return isFileChange(filePath, typePath);
}

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
    const sourceFiles = {};
    sourceFiles[path.resolve(__dirname, '../modules.d.ts')] =
        project.addSourceFileAtPath(path.resolve(__dirname, '../modules.d.ts'));

    files.forEach((file) => {
        sourceFiles[file] = project.addSourceFileAtPath(file);
    });

    if (!isWatch()) {
        const diagnostics = project.getPreEmitDiagnostics();
        // 输出解析过程中的错误信息
        console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));
    }

    project.emitToMemory();

    // 随后将解析完的文件写道打包路径
    for (const [filePath, sourceFile] of Object.entries(sourceFiles)) {
        if (isTypeChange(filePath)) {
            await genType(sourceFile);
        }
    }

    return {
        project,
        sourceFiles,
    };
}

async function buildTypes() {
    const pkgs = [
        'types',
        'utils',
        'editor-core',
        'editor-skeleton',
        'designer',
        'plugin-designer',
        'engine',
        'renderer',
        'simulator-renderer',
        'engine',
        'plugin-components-panel',
    ];
    const projects = {};
    for (const pkg of pkgs) {
        projects[pkg] = await genPkgType(pkg);
    }

    if (isWatch()) {
        watch(async (filePath) => {
            const wFilePath = 'packages' + filePath.split('packages')[1];
            const pkg = filePath.split('packages/')[1].split('/')[0];
            const project = projects[pkg];
            let sourceFile = project.sourceFiles[wFilePath];
            if (sourceFile) {
                await sourceFile.refreshFromFileSystem();
            } else if (
                wFilePath.endsWith('.ts') ||
                wFilePath.endsWith('.tsx')
            ) {
                sourceFile = project.project.addSourceFileAtPath(wFilePath);
                project.sourceFiles[wFilePath] = sourceFile;
            }
            try {
                if (sourceFile) {
                    await genType(sourceFile);
                }
            } catch (e) {}
        });
    }
}

module.exports = {
    buildTypes,
};
