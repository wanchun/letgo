import type { Monaco } from '@monaco-editor/loader';
import loader from '@monaco-editor/loader';
import { isEqual } from 'lodash-es';
import type { EditorMeta } from './controller';
import { controller } from './controller';

let monaco: Monaco;
let prevOptions: any;
export async function getSingletonMonaco(options?: any): Promise<Monaco> {
    if (!monaco || !isEqual(prevOptions, options)) {
        const hasConfig = Object.keys(options || {}).length > 0;
        loader.config(
            hasConfig
                ? options
                : {
                        paths: {
                            vs: 'https://g.alicdn.com/code/lib/monaco-editor/0.50.0/min/vs',
                        },
                    },
        );

        monaco = await loader.init();

        prevOptions = options;
    }
    return monaco;
}

export function getCommonMonaco(config: any): Promise<Monaco> {
    if (config) {
        loader.config(config);
    }
    else {
        loader.config({
            paths: {
                vs: 'https://g.alicdn.com/code/lib/monaco-editor/0.50.0/min/vs',
            },
        });
    }
    return loader.init();
}

export function getMonaco(config?: any): Promise<Monaco> {
    const hasConfig = Object.keys(config || {}).length > 0;
    const monacoConfig = hasConfig ? config : undefined;
    return controller.getMeta().singleton
        ? getSingletonMonaco(monacoConfig)
        : getCommonMonaco(monacoConfig);
}

export function configure(config: EditorMeta) {
    controller.updateMeta(config);
}
