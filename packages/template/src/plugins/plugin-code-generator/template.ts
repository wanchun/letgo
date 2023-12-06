export default {
    '.env': 'TEST_HOST=http://f1.test-adm.weoa.com',
    '.eslintrc': '{\n    "extends": "@webank/eslint-config-vue"\n}\n',
    '.fes.js': `
import { defineBuildConfig } from '@fesjs/fes';
export default defineBuildConfig({
    proxy: {
        '/rcs-mas\': {
            target: process.env.TEST_HOST,
            secure: false,
            changeOrigin: true,
        },
    },
    {{#IS_MICRO}}
    qiankun: {
        micro: {
            useDevMode: true,
        },
    },
    {{/IS_MICRO}}
});
    `,
    '.fes.prod.js': 'import { defineBuildConfig } from \'@fesjs/fes\';\n\nexport default defineBuildConfig({\n    publicPath: \'./\',\n});\n',
    '.fes.test.js': 'import { defineBuildConfig } from \'@fesjs/fes\';\n\nexport default defineBuildConfig({\n    publicPath: \'./\',\n});\n',
    '.gitignore': '.DS_Store\n.cache\n\n# dependencies\n/node_modules\n/coverage\n\n# fes\n/src/.fes\n/src/.fes-production\n/src/.fes-test\n.env.local\n',
    '.npmrc': 'registry=http://wnpm.weoa.com:8001\nshamefully-hoist=true',
    '.vscode': {
        'settings.json': '{\n    "prettier.enable": false,\n    "editor.formatOnSave": false,\n    "editor.codeActionsOnSave": {\n      "source.fixAll.eslint": true,\n      "source.organizeImports": false\n    },\n  \n    // The following is optional.\n    // It\'s better to put under project setting `.vscode/settings.json`\n    // to avoid conflicts with working with different eslint configs\n    // that does not support all formats.\n    "eslint.validate": [\n      "javascript",\n      "javascriptreact",\n      "typescript",\n      "typescriptreact",\n      "vue",\n      "html",\n      "markdown",\n      "json",\n      "jsonc",\n      "yaml"\n    ]\n  }',
    },
    'index.html': `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>
            {{{TITLE}}}
        </title>
        <link rel="shortcut icon" type="image/x-icon" href="./logo.svg">
    </head>
    <body>
        {{{SVG_SPRITE}}}
        <div id="<%= mountElementId %>"></div>
    </body>
</html>`,
    'public': {
        'logo.svg': '<?xml version="1.0" encoding="UTF-8"?>\n<svg width="362px" height="233px" viewBox="0 0 362 233" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n    <title>编组 11</title>\n    <defs>\n        <linearGradient x1="50%" y1="23.3539127%" x2="50%" y2="75.8919734%" id="linearGradient-1">\n            <stop stop-color="#AAF2DA" offset="0%"></stop>\n            <stop stop-color="#34CD9A" offset="100%"></stop>\n        </linearGradient>\n        <linearGradient x1="50%" y1="100%" x2="50%" y2="3.061617e-15%" id="linearGradient-2">\n            <stop stop-color="#599EFF" offset="0%"></stop>\n            <stop stop-color="#1973F2" offset="99.9127581%"></stop>\n        </linearGradient>\n        <linearGradient x1="100%" y1="50%" x2="0%" y2="50%" id="linearGradient-3">\n            <stop stop-color="#1973F2" offset="0.0872418597%"></stop>\n            <stop stop-color="#599EFF" offset="100%"></stop>\n        </linearGradient>\n    </defs>\n    <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\n        <g id="Fes-logo" transform="translate(-312.000000, -180.000000)">\n            <g id="编组-11" transform="translate(312.938719, 180.587900)">\n                <rect id="矩形备份-186" fill="url(#linearGradient-1)" transform="translate(179.801981, 116.472643) scale(-1, 1) rotate(-45.000000) translate(-179.801981, -116.472643) " x="143.248626" y="-10.2344074" width="73.1067103" height="253.414101" rx="30.7817728"></rect>\n                <g id="编组-16备份-10" transform="translate(115.948055, 115.948055) rotate(-45.000000) translate(-115.948055, -115.948055) translate(33.950773, 33.970025)">\n                    <path d="M0.0481867714,59.2637891 L59.3119758,59.2637891 L59.3119758,163.956059 L30.8299595,163.956059 C13.8296559,163.956059 0.0481867714,150.17459 0.0481867714,133.174287 L0.0481867714,59.2637891 L0.0481867714,59.2637891 Z" id="矩形备份-182" fill="url(#linearGradient-2)"></path>\n                    <path d="M0.0472202895,75.9520701 L0.0481867714,59.2637891 L0.0461296915,59.2637891 L0.017351946,24.1772609 L3.99314558e-07,24.1681816 C-0.00247808834,10.9598356 11.5330724,0.230998197 25.8645189,0.0036581736 L26.3655734,4.54747351e-13 L133.183567,4.54747351e-13 C150.177656,0.0145961112 163.956549,12.642143 163.981254,28.2242722 L163.994554,51.8115325 C164.001076,55.9272978 160.666468,59.265668 156.5507,59.2679887 C156.5493,59.2679895 156.547899,59.2679899 156.546498,59.2637891 L18.0022314,59.2637891 C8.50175631,59.2637891 0.720152073,66.62315 0.0472202895,75.9520701 Z" id="形状结合" fill="url(#linearGradient-3)"></path>\n                </g>\n                <g id="编组-16备份-11" transform="translate(244.595176, 115.948055) scale(-1, -1) rotate(-45.000000) translate(-244.595176, -115.948055) translate(162.597894, 33.970025)">\n                    <path d="M0.0481867714,59.2637891 L59.3119758,59.2637891 L59.3119758,163.956059 L30.8299595,163.956059 C13.8296559,163.956059 0.0481867714,150.17459 0.0481867714,133.174287 L0.0481867714,59.2637891 L0.0481867714,59.2637891 Z" id="矩形备份-182" fill="url(#linearGradient-2)"></path>\n                    <path d="M0.0472202895,75.9520701 L0.0481867714,59.2637891 L0.0461296915,59.2637891 L0.017351946,24.1772609 L3.99314558e-07,24.1681816 C-0.00247808834,10.9598356 11.5330724,0.230998197 25.8645189,0.0036581736 L26.3655734,4.54747351e-13 L133.183567,4.54747351e-13 C150.177656,0.0145961112 163.956549,12.642143 163.981254,28.2242722 L163.994554,51.8115325 C164.001076,55.9272978 160.666468,59.265668 156.5507,59.2679887 C156.5493,59.2679895 156.547899,59.2679899 156.546498,59.2637891 L18.0022314,59.2637891 C8.50175631,59.2637891 0.720152073,66.62315 0.0472202895,75.9520701 Z" id="形状结合" fill="url(#linearGradient-3)"></path>\n                </g>\n            </g>\n        </g>\n    </g>\n</svg>',
    },
    'src': {
        'letgo': {
            // eslint-disable-next-line no-template-curly-in-string
            'letgoRequest.js': 'import { pum } from \'@fesjs/fes\';\nimport { FMessage } from \'@fesjs/fes-design\';\nimport { createRequest } from \'@qlin/request\';\n\nexport const letgoRequest = createRequest({\n    mergeRequest: true,\n    mode: \'cors\',\n    credentials: \'same-origin\',\n    errorHandler(error) {\n        if (error.response.status === 401)\n            return pum.redirectToLogin();\n\n        if (error.response) {\n            // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围\n            FMessage.error(`服务端异常：${error.response.status}`);\n        } else if (error.msg) {\n            FMessage.error(error.msg);\n        } else {\n            // 发送请求时出了点问题\n            FMessage.error(error.message);\n        }\n        console.log(\'request error\', error);\n    },\n});\n',
        },
        'global.less': `@import './letgo/global.css'`,
        'app.jsx': `
import { defineRuntimeConfig,{{#HAS_WATERMARK}} createWatermark,{{/HAS_WATERMARK}}{{#HAS_UM}} um,{{/HAS_UM}}{{#HAS_PUM}} request, pum,{{/HAS_PUM}} {{#HAS_ACCESS}} access,{{/HAS_ACCESS}} } from '@fesjs/fes';
import { FMessage } from '@fesjs/fes-design';
import { builtinComponents } from '@harrywan/letgo-components';
{{#HAS_LAYOUT}}
import CustomHeader from '@/components/customHeader.vue';
{{/HAS_LAYOUT}}

export default defineRuntimeConfig({
    onAppCreated: ({ app }) => {
        app.component('Icon', builtinComponents.Icon);
    },
    beforeRender: {
        async action() {
            {{^HAS_MICRO}}
            // 非微前端场景

            {{#HAS_UM}}
            // 使用UM认证登录
            const userInfo = await um.login();
            {{#HAS_ACCESS}}
            access.setAccess(userInfo.uriList.concat('/'));
            {{/HAS_ACCESS}}
            if (userInfo.user) {
                {{#HAS_WATERMARK}}
                // 使用水印
                createWatermark({
                    content: userInfo.user,
                });
                {{/HAS_WATERMARK}}
            } else {
                console.error('获取用户信息异常 || userInfo:', userInfo);
            }
            return userInfo
            {{/HAS_UM}}

            {{#HAS_PUM}}
            // 使用pum认证登录
            await pum.login();
            const userInfo = await request('/um/uri', {}, {
                dataHandler: (data) => data,
                method: 'get',
                dataField: false,
                closeResDataCheck: true,
            });
            {{#HAS_ACCESS}}
            access.setAccess(userInfo.uriList.concat('/'));
            {{/HAS_ACCESS}}
            if (userInfo.user) {
                {{#HAS_WATERMARK}}
                // 使用水印
                createWatermark({
                    content: userInfo.user,
                });
                {{/HAS_WATERMARK}}
            } else {
                console.error('获取用户信息异常 || userInfo:', userInfo);
            }
            return userInfo
            {{/HAS_PUM}}

            {{/HAS_MICRO}}

            {{#HAS_MICRO}}
            // 微前端场景

            {{#HAS_UM}}
            // 使用UM认证登录
            const userInfo = await um.login();
            if (userInfo.user) {
                {{#HAS_WATERMARK}}
                // 使用水印
                createWatermark({
                    content: userInfo.user,
                });
                {{/HAS_WATERMARK}}
            } else {
                console.error('获取用户信息异常 || userInfo:', userInfo);
            }
            return userInfo
            {{/HAS_UM}}

            {{#HAS_PUM}}
            // 使用pum认证登录
            const userInfo = await request('/um/uri', {}, {
                dataHandler: (data) => data,
                method: 'get',
                dataField: false,
                closeResDataCheck: true,
            });
            if (userInfo.user) {
                {{#HAS_WATERMARK}}
                // 使用水印
                createWatermark({
                    content: userInfo.user,
                });
                {{/HAS_WATERMARK}}
            } else {
                console.error('获取用户信息异常 || userInfo:', userInfo);
            }
            {{/HAS_PUM}}
            {{/HAS_MICRO}}
        }
    },
    request: {
        {{#API_PREFIX}}
        baseURL: '{{{API_PREFIX}}}',
        {{/API_PREFIX}}
        transformData(data) {
            if (data.code != 0)
                return Promise.reject(data);

            return data;
        },
        errorHandler(error) {
            if (error.code) {
                FMessage.error(error.msg || '请求成功，但响应不符合预期');
            } else if (error.response) {
                if (error.response.status === 403) {
                    // 有页面资源权限，但无接口资源权限
                    FMessage.error('当前页面部分功能您没有权限，可能影响您的使用，请联系系统管理员进行处理');
                } else {
                    // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
                    FMessage.error(\`服务异常：\${error.response.status}\`);
                }
            } else {
                // 请求异常
                FMessage.error(error.msg || error.message || '系统异常');
            }
            console.error(error);
        }
    },
    {{#UM_RUNTIME}}
    um: (initConfig) => ({
        ...initConfig,
        ...{{{UM_RUNTIME}}},
    }),
    {{/UM_RUNTIME}}
    {{#PUM_CONFIG}}
    pum: (initConfig) => ({
        ...initConfig,
        ...{{{PUM_CONFIG}}},
    }),
    {{/PUM_CONFIG}}
    {{#HAS_LAYOUT}}
    layout: (layoutConfig) => ({
        ...layoutConfig,
        renderCustom: () => <CustomHeader />,
    }),
    {{/HAS_LAYOUT}}
});
        `,
    },
    'tsconfig.json': '{\n  "compilerOptions": {\n    "module": "esnext",\n    "target": "esnext",\n    "lib": [\n      "esnext",\n      "dom"\n    ],\n    "sourceMap": true,\n    "baseUrl": ".",\n    "jsx": "preserve",\n    "allowSyntheticDefaultImports": true,\n    "moduleResolution": "node",\n    "forceConsistentCasingInFileNames": true,\n    "noImplicitReturns": true,\n    "noUnusedLocals": true,\n    "allowJs": true,\n    "experimentalDecorators": true,\n    "strict": true,\n    "paths": {\n      "@/*": [\n        "./src/*"\n      ],\n      "@@/*": [\n        "./src/.fes/*"\n      ]\n    }\n  },\n  "include": [\n    "src",\n    "package.json"\n  ]\n}',
};
