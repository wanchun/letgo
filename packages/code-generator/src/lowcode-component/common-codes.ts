export const COMMON_CODES = {
    src: {
        'index.js': `
        import { version } from '../package.json';
    
        export * from './components';
        
        export default {
            version,
        };
    `,
        'index.meta.js': `
        import { letgoConfig, name, version } from '../package.json';
        import * as componentsMeta from './meta';
        
        export default {
            packages: [
                {
                    package: name,
                    version,
                    urls: [\`/material/\${name}@\${version}/index.js\`],
                    library: letgoConfig.library,
                },
            ],
            components: Object.keys(componentsMeta).map((key) => componentsMeta[key as keyof typeof componentsMeta]),
            sort: {
                groupList: ['低代码组件'],
            },
        };
        
        `,
    },
};
