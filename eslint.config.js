// eslint.config.js
import antfu from '@antfu/eslint-config';

export default await antfu({
    stylistic: {
        indent: 4, // 4, or 'tab'
        quotes: 'single', // or 'double'
        semi: true,
    },
    rules: {
        'no-undef': 'error',
    },
    typescript: true,
    vue: true
}, {
    languageOptions: {
        globals: {
            ENGINE_VERSION_PLACEHOLDER: 'readonly',
            ENGINE_EXT_VERSION_PLACEHOLDER: 'readonly',
        },
    },
});
