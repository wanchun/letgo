// import { useLetgoConfig } from '@/use/useLetgoGlobal';
// ${genComponentImports(componentMaps)}

import type { SetupCode } from './types';
import { ImportType } from './types';

// const {${genConfigKeys(context.config)}} = useLetgoConfig();
function genConfigKeys(config: Record<string, any>) {
    return Object.keys(config).join(', ');
}

export function genGlobalConfig(config?: Record<string, any>): SetupCode {
    if (!config) {
        return {
            importSources: [],
            code: '',
        };
    }
    return {
        importSources: [{
            imported: 'useLetgoConfig',
            type: ImportType.ImportSpecifier,
            source: '@/use/useLetgoGlobal',
        }],
        code: `const {${genConfigKeys(config)}} = useLetgoConfig()`,
    };
}
