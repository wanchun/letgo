import init, {	type RomePath as BiomePath,	type Configuration,	DiagnosticPrinter,	type RuleCategories, Workspace } from '@biomejs/wasm-web';
import {
    type BiomeOutput,
    LoadingState,
} from './types';

let workspace: Workspace | null = null;
let fileCounter = 0;

interface File {
    filename: string
    id: number
    content: string
    version: number
}

const files: Map<string, File> = new Map();

const configuration: Configuration = {
    formatter: {
        enabled: true,
        formatWithErrors: true,
        lineWidth: 80,
        indentStyle: 'space',
        indentWidth: 2,
    },
    linter: {
        enabled: true,
        rules: {
            nursery: {
                recommended: false,
            },
        },
    },
    organizeImports: {
        enabled: false,
    },
    javascript: {
        formatter: {
            quoteStyle: 'single',
            jsxQuoteStyle: 'double',
            quoteProperties: 'asNeeded',
            trailingComma: 'all',
            semicolons: 'always',
            arrowParentheses: 'always',
            bracketSpacing: true,
            bracketSameLine: false,
        },
        parser: {
            unsafeParameterDecoratorsEnabled: true,
        },
    },
    json: {
        parser: {
            allowComments: true,
        },
    },
};

function getPathForFile(file: File): BiomePath {
    return {
        path: file.filename,
    };
}

globalThis.addEventListener('message', async (e) => {
    switch (e.data.type) {
        case 'init': {
            try {
                await init();

                workspace = new Workspace();
                workspace.updateSettings({
                    configuration,
                });
                globalThis.postMessage({ type: 'init', loadingState: LoadingState.Success });
            }
            catch (err) {
                console.error(err);
                globalThis.postMessage({ type: 'init', loadingState: LoadingState.Error });
            }

            break;
        }

        case 'updateGlobals': {
            configuration.javascript.globals = e.data.globals;

            if (!workspace) {
                console.error('Workspace was not initialized');
                break;
            }

            workspace.updateSettings({ configuration });
            break;
        }

        case 'update': {
            if (!workspace) {
                console.error('Workspace was not initialized');
                break;
            }

            const { filename, code } = e.data;
            let file = files.get(filename);
            if (file === undefined) {
                file = {
                    filename,
                    version: 0,
                    content: code,
                    id: fileCounter++,
                };

                workspace.openFile({
                    path: getPathForFile(file),
                    version: 0,
                    content: code,
                });
            }
            else {
                file = {
                    filename,
                    id: file.id,
                    version: file.version + 1,
                    content: code,
                };

                workspace.openFile({
                    path: getPathForFile(file),
                    version: file.version,
                    content: code,
                });
            }
            files.set(filename, file);
            const path = getPathForFile(file);

            const categories: RuleCategories = [];
            if (configuration?.formatter?.enabled)
                categories.push('Syntax');

            if (configuration?.linter?.enabled)
                categories.push('Lint');

            const diagnosticsResult = workspace.pullDiagnostics({
                path,
                categories,
                max_diagnostics: Number.MAX_SAFE_INTEGER,
            });

            const printer = new DiagnosticPrinter(path.path, code);
            for (const diag of diagnosticsResult.diagnostics)
                printer.print_verbose(diag);

            const printed = workspace.formatFile({
                path,
            });

            const biomeOutput: BiomeOutput = {
                diagnostics: {
                    console: printer.finish(),
                    list: diagnosticsResult.diagnostics,
                },
                formatter: printed.code,
            };

            globalThis.postMessage({
                type: 'updated',
                filename,
                biomeOutput,
            });
            break;
        }

        default:
            console.error(`Unknown message '${e.data.type}'.`);
    }
});
