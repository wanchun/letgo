import { defineConfig } from 'father';
import { VueLoaderPlugin } from 'vue-loader';

export default defineConfig({
    extraBabelPlugins: ['@vue/babel-plugin-jsx'],
    cjs: {
        output: 'lib',
    },
    esm: {
        output: 'es',
    },
});
