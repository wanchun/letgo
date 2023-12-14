import type { IPublicTypeAssetsJson } from '@webank/letgo-types';

const assets: IPublicTypeAssetsJson = {
    packages: [
        {
            package: 'element-tiptap',
            library: 'ElementTiptap',
            version: '2.2.1',
            urls: [
                'https://registry.npmmirror.com/element-tiptap/2.2.1/files/lib/element-tiptap.umd.js',
                'https://registry.npmmirror.com/element-tiptap/2.2.1/files/lib/style.css',
            ],
        },
    ],
    components: [
        {
            title: '富文本',
            componentName: 'ElementTiptap',
            npm: {
                package: 'element-tiptap',
                version: '2.2.0',
                exportName: 'ElementTiptap',
                destructuring: true,
            },
            props: [
                {
                    name: 'content',
                    propType: 'string',
                },
            ],
            configure: {
                supports: {
                    style: true,
                    events: [],
                },
                props: [
                    {
                        name: 'content',
                        title: '文本内容',
                        setter: 'TextareaSetter',
                    },
                ],
            },
            snippets: [
                {
                    title: '富文本',
                    schema: {
                        componentName: 'ElementTiptap',
                        props: {
                        },
                    },
                },
            ],
            group: '精选组件',
            category: '数据录入',
            priority: 0,
        },
    ],
    sort: {
        groupList: ['精选组件'],
        categoryList: [
            '数据录入',
        ],
    },
};

export default assets;
