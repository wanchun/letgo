import { OxcWrap } from './oxc';

import {
    LoadingState,
    type OxcOutput,
} from './types';

let oxc: OxcWrap | null = null;

globalThis.addEventListener('message', async (e) => {
    switch (e.data.type) {
        case 'init': {
            try {
                oxc = new OxcWrap();
                await oxc.initOxc();

                globalThis.postMessage({ type: 'init', loadingState: LoadingState.Success });
            }
            catch (err) {
                console.error(err);
                globalThis.postMessage({ type: 'init', loadingState: LoadingState.Error });
            }

            break;
        }

        case 'update': {
            if (!oxc) {
                console.error('Workspace was not initialized');
                break;
            }

            const { filename, code } = e.data;

            oxc.runOxc(code);

            const formatDoc = oxc.getFormat().trim();
            const oxcOutput: OxcOutput = {
                diagnostics: oxc.getDiagnostics(),
                formatter: formatDoc.endsWith(';') ? formatDoc.slice(0, -1) : formatDoc,
            };

            globalThis.postMessage({
                type: 'updated',
                filename,
                oxcOutput,
            });
            break;
        }

        default:
            console.error(`Unknown message '${e.data.type}'.`);
    }
});
