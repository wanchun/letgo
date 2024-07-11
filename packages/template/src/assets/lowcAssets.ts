import type { IPublicTypeAssetsJson } from '@webank/letgo-engine';

const assets: IPublicTypeAssetsJson = {
    packages: [
        {
            package: '@fesjs/fes-design',
            version: '0.8.50',
            urls: [
                // '/material/@webank/fes-design-material@0.2.19/fes-design.js',
                // '/material/@webank/fes-design-material@0.2.19/fes-design.css',
                'http://127.0.0.1:8000/material/@webank/fes-design-material@0.2.19/fes-design.js',
                'http://127.0.0.1:8000/material/@webank/fes-design-material@0.2.19/fes-design.css',
            ],
            library: 'FesDesign',
        },
        {
            package: '@webank/fes-design-material',
            version: '0.2.19',
            urls: [
                // '/material/@webank/fes-design-material@0.2.19/index.js',
                // '/material/@webank/fes-design-material@0.2.19/index.css',
                'http://127.0.0.1:8000/material/@webank/fes-design-material@0.2.19/index.js',
                'http://127.0.0.1:8000/material/@webank/fes-design-material@0.2.19/index.css',
            ],
            library: 'FesDesignPro',
        },
        {
            package: '@webank/we-utils',
            version: '2.2.5',
            library: 'WU',
            urls: [
                // '/library/@webank/we-utils@2.2.5',
                'http://127.0.0.1:8000/library/@webank/we-utils@2.2.5',
            ],
        },
        {
            title: '表格',
            id: 'LCyy4JHcmu0Z',
            version: '1.0.0',
            type: 'lowCode',
            schema: {
                version: '1.0.0',
                utils: [{
                    name: 'FMessage',
                    type: 'npm',
                    content: { package: '@fesjs/fes-design', version: '0.8.50', exportName: 'FMessage', destructuring: true },
                }, {
                    name: 'FModal',
                    type: 'npm',
                    content: { package: '@fesjs/fes-design', version: '0.8.50', exportName: 'FModal', destructuring: true },
                }, {
                    name: 'WU',
                    type: 'wnpm',
                    content: { version: '2.2.5', package: '@webank/we-utils', exportName: 'WU', destructuring: false, assembling: false },
                }],
                componentsMap: [{
                    devMode: 'lowCode',
                    componentName: 'Component',
                }, {
                    package: '@fesjs/fes-design',
                    version: '0.8.50',
                    exportName: 'FButton',
                    destructuring: true,
                    componentName: 'FButton',
                }],
                componentsTree: [
                    {
                        id: 'LCyy4JHcmu0Z',
                        componentName: 'Component',
                        props: {},
                        fileName: 'LCyy4JHcmu0Z',
                        code: { directories: [], code: [] },
                        title: '表格',
                        children: [{
                            componentName: 'FButton',
                            id: 'fButton1',
                            ref: 'fButton1',
                            props: { children: '按钮' },
                            title: '按钮',
                            isLocked: false,
                            condition: true,
                        }, {
                            componentName: 'FButton',
                            id: 'fButton2',
                            ref: 'fButton2',
                            props: { children: '按钮' },
                            title: '按钮',
                            isLocked: false,
                            condition: true,
                        }],
                        definedProps: [],
                    },
                ],
            },
            library: 'LCyy4JHcmu0Z',
        },
    ],
    components: [
        {
            title: '表格',
            componentName: 'LCyy4JHcmu0Z',
            reference: {
                id: 'LCyy4JHcmu0Z',
                version: '1.0.0',
                subName: '',
                exportName: 'LCyy4JHcmu0Z',
                destructuring: false,
            },
            devMode: 'lowCode',
            configure: {
                supports: {
                    style: true,
                },
                props: [],
            },
            snippets: [
                {
                    title: '表格',
                    schema: {
                        componentName: 'LCyy4JHcmu0Z',
                        props: {},
                    },
                },
            ],
            category: '组件',
            group: '低代码组件',
            priority: 0,
        },
        {
            title: '按钮',
            componentName: 'FButton',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FButton',
                destructuring: true,
            },
            props: [
                {
                    name: 'children',
                    propType: 'string',
                },
                {
                    name: 'disabled',
                    propType: 'bool',
                },
                {
                    name: 'size',
                    propType: 'string',
                },
                {
                    name: 'htmlType',
                    propType: 'string',
                },
                {
                    name: 'loading',
                    propType: 'bool',
                },
                {
                    name: 'long',
                    propType: 'bool',
                },
                {
                    name: 'throttle',
                    propType: 'number',
                },
                {
                    name: 'type',
                    propType: 'string',
                },
            ],
            configure: {
                props: [
                    {
                        title: '按钮功能',
                        type: 'group',
                        extraProps: {
                            display: 'block',
                        },
                        items: [
                            {
                                name: 'children',
                                title: '按钮内容',
                                setter: 'StringSetter',
                            },
                            {
                                name: 'disabled',
                                title: '是否禁用',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'loading',
                                title: '显示加载状态',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'throttle',
                                title: '截流',
                                description: '开启截流时，\n可以防止多次点击',
                                setter: 'NumberSetter',
                                defaultValue: 300,
                            },
                            {
                                name: 'htmlType',
                                title: '按钮功能',
                                setter: {
                                    componentName: 'RadioGroupSetter',
                                    props: {
                                        options: [
                                            {
                                                label: '普通按钮',
                                                value: 'button',
                                            },
                                            {
                                                label: '表单提交',
                                                value: 'submit',
                                            },
                                        ],
                                    },
                                },
                                defaultValue: 'button',
                            },
                        ],
                    },
                    {
                        name: 'action',
                        title: '按钮样式',
                        type: 'group',
                        extraProps: {
                            display: 'block',
                        },
                        items: [
                            {
                                name: 'type',
                                title: '按钮的类型',
                                setter: {
                                    componentName: 'SelectSetter',
                                    props: {
                                        options: [
                                            {
                                                label: '默认',
                                                value: 'default',
                                            },
                                            {
                                                label: '重要',
                                                value: 'primary',
                                            },
                                            {
                                                label: '文本',
                                                value: 'text',
                                            },
                                            {
                                                label: '链接',
                                                value: 'link',
                                            },
                                            {
                                                label: '信息',
                                                value: 'info',
                                            },
                                            {
                                                label: '成功',
                                                value: 'success',
                                            },
                                            {
                                                label: '警告',
                                                value: 'warning',
                                            },
                                            {
                                                label: '危险',
                                                value: 'danger',
                                            },
                                        ],
                                    },
                                },
                                defaultValue: 'default',
                            },
                            {
                                name: 'size',
                                title: '按钮的尺寸',
                                setter: {
                                    componentName: 'RadioGroupSetter',
                                    props: {
                                        options: [
                                            {
                                                label: '小',
                                                value: 'small',
                                            },
                                            {
                                                label: '中',
                                                value: 'middle',
                                            },
                                            {
                                                label: '大',
                                                value: 'large',
                                            },
                                        ],
                                    },
                                },
                                defaultValue: 'middle',
                            },
                            {
                                name: 'long',
                                title: '长按钮',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'icon',
                                title: '图标',
                                setter: {
                                    componentName: 'IconSetter',
                                    props: {
                                        type: 'node',
                                    },
                                },
                            },
                        ],
                    },
                ],
                supports: {
                    class: true,
                    style: true,
                    loop: true,
                    events: ['onClick'],
                },
            },
            snippets: [
                {
                    keywords: 'btn',
                    title: '按钮',
                    // screenshot:
                    //     'https://helios-allpublic-1257616148.cos.ap-shanghai.myqcloud.com/img/button.png',
                    schema: {
                        componentName: 'FButton',
                        props: {
                            children: '按钮',
                        },
                    },
                },
            ],
            group: '原子组件',
            category: '基础元素',
            priority: 0,
        },
    ],
    sort: {
        groupList: ['低代码组件'],
        categoryList: ['组件'],
    },
};

export default assets;
