import type { IPublicTypeAssetsJson } from '@harrywan/letgo-types';

const assets: IPublicTypeAssetsJson = {
    packages: [
        {
            package: 'lodash',
            library: '_',
            version: '4.6.1',
            urls: [
                'https://g.alicdn.com/platform/c/lodash/4.6.1/lodash.min.js',
            ],
        },
        {
            package: '@fesjs/fes-design',
            version: '0.8.15',
            urls: [
                'http://localhost:8000/material/@webank/fes-design-material@0.0.8/fes-design.js',
                'http://localhost:8000/material/@webank/fes-design-material@0.0.8/fes-design.css',
            ],
            library: 'FesDesign',
        },
        {
            package: '@webank/fes-design-materia',
            version: '0.0.8',
            urls: [
                'http://localhost:8000/material/@webank/fes-design-material@0.0.8/fes-design.js',
                'http://localhost:8000/material/@webank/fes-design-material@0.0.8/fes-design.css',
                'http://localhost:8000/material/@webank/fes-design-material@0.0.8/index.js',
                'http://localhost:8000/material/@webank/fes-design-material@0.0.8/index.css',
            ],
            library: 'FesDesignPro',
        },
    ],
    components: [{
        exportName: 'FesDesignProMeta',
        url: 'http://localhost:8000/material/@webank/fes-design-material@0.0.8/index.meta.js',
    }],
    sort: {
        groupList: ['原子组件', '智能推导', '精选组件'],
        categoryList: [
            '基础元素',
            '通用组件',
            '布局组件',
            '导航组件',
            '数据录入',
            '信息展示',
            '信息反馈',
            '对话框类',
            '表单组件',
        ],
    },
};

export default assets;
