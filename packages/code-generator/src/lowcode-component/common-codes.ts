export const COMMON_CODES = {
    src: {
        'index.js': `
        import { version } from '../package.json';
    
        export * from './components';
        
        export default {
            version,
        };
    `,
    },
};
