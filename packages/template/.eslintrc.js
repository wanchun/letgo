module.exports = {
    extends: ['@webank/eslint-config-ts/vue.js'],
    overrides: [
        {
            files: [
                '**/__tests__/*.{j,t}s?(x)',
                '**/tests/unit/**/*.spec.{j,t}s?(x)',
            ],
        },
    ],
    env: {
        jest: true,
    },
    rules: {
        'vue/multi-word-component-names': 'off',
        'vue/no-v-model-argument': 'off',
    },
};
