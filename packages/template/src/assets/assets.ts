import type { IPublicModelSettingField, IPublicTypeAssetsJson } from '@webank/letgo-types';

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
            version: '0.8.38',
            urls: [
                'https://registry.npmmirror.com/@fesjs/fes-design/0.8.38/files/dist/fes-design.js',
                'https://registry.npmmirror.com/@fesjs/fes-design/0.8.38/files/dist/fes-design.css',
            ],
            library: 'FesDesign',
        },
        {
            package: 'vant',
            version: '4.9.0',
            urls: [
                'https://registry.npmmirror.com/vant/4.9.0/files/lib/vant.min.js',
                'https://registry.npmmirror.com/vant/4.9.0/files/lib/index.css',
            ],
            library: 'vant',
            cssResolver: (componentName: string) => {
                if (componentName === 'showToast')
                    return `vant/lib/toast/style`;

                return `vant/lib/${componentName}/style`;
            },
        },
        {
            title: '低代码组件 A',
            id: 'lcc-a',
            version: '0.1.5',
            type: 'lowCode',
            schema: {
                componentsMap: [
                    {
                        componentName: 'FButton',
                        exportName: 'FButton',
                        package: '@fesjs/fes-design',
                        version: '0.8.38',
                    },
                    {
                        componentName: 'FText',
                        exportName: 'FText',
                        package: '@fesjs/fes-design',
                        version: '0.8.38',
                    },
                ],
                componentsTree: [{
                    componentName: 'Component',
                    id: 'lcc-a',
                    props: {
                        btnName: '确认',
                    },
                    definedProps: [
                        {
                            title: '文本',
                            name: 'btnName',
                        },
                    ],
                    fileName: 'compText',
                    code: {
                        directories: [],
                        code: [
                            {
                                id: 'function1',
                                type: 'function',
                                funcBody: '// Tip: 函数\nfunction func() {\n  console.log("hello");\n}',
                            },
                            {
                                id: 'num',
                                type: 'temporaryState',
                                initValue: '2',
                            },
                        ],
                    },
                    isLocked: false,
                    condition: true,
                    title: '',
                    children: [
                        {
                            componentName: 'FButton',
                            id: 'fButton1',
                            ref: 'fButton1',
                            props: {
                                children: {
                                    type: 'JSExpression',
                                    value: 'props.btnName',
                                    mock: null,
                                },
                                type: 'primary',
                            },
                            isLocked: false,
                            condition: true,
                            title: '',
                            events: [
                                {
                                    id: 'event_lu56ytlr',
                                    name: 'onClick',
                                    action: 'runFunction',
                                    namespace: 'function1',
                                    funcBody: '',
                                    params: [],
                                },
                            ],
                        },
                        {
                            componentName: 'FText',
                            id: 'fText1',
                            ref: 'fText1',
                            props: {
                                children: '文本内容',
                            },
                            isLocked: false,
                            condition: true,
                            title: '',
                        },
                    ],
                },
                ],
            },
            library: 'CompText',
        },
    ],
    components: [
        {
            title: 'vant按钮',
            componentName: 'van-button',
            npm: {
                package: 'vant',
                version: '4.9.0',
                exportName: 'Button',
                destructuring: true,
            },
            props: [
                {
                    name: 'text',
                    title: '文字',
                    propType: 'string',
                },
            ],
            snippets: [
                {
                    title: 'vant按钮',
                    schema: {
                        componentName: 'van-button',
                        props: {
                            type: 'primary',
                            size: 'normal',
                            text: '按钮',
                        },
                    },
                },
            ],
            category: '基础元素',
            group: '原子组件',
            priority: 0,
        },
        {
            title: '拖拽',
            componentName: 'FDraggable',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.17',
                exportName: 'FDraggable',
                destructuring: true,
            },
            configure: {
                props: [
                    {
                        name: 'v-model',
                        title: '绑定变量',
                        setter: 'VariableSetter',
                    },
                    {
                        name: 'tag',
                        title: '根标签',
                        description: '指定组件的root dom 类型',
                        setter: 'StringSetter',
                    },
                    {
                        name: 'disabled',
                        title: '禁止拖拽',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'droppable',
                        title: '禁止放置',
                        description: '其他容器的项是否可以放置到当前容器，设置为 droppable 的容器都可以相互拖拽放置',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'beforeDragend',
                        title: '拖拽结束前',
                        description:
                            '拖拽结束之前回调，返回 false、Promise.resolve(false)、Promise.reject()时，拖拽会恢复之前的状态',
                        setter: {
                            componentName: 'FunctionSetter',
                            props: {
                                placeholder: '(drag, drop) => Promise.resolve(false)',
                            },
                        },
                    },
                    {
                        name: 'item',
                        title: '拖拽项自定义',
                        setter: 'SlotSetter',
                        defaultValue: {
                            type: 'JSSlot',
                            name: 'default',
                            params: ['slotProps'],
                        },
                    },
                ],
                component: {
                    isContainer: true,
                },
                supports: {
                    style: true,
                    class: true,
                    events: ['dragstart', 'dragend'],
                },
            },
            snippets: [
                {
                    title: '拖拽容器',
                    schema: {
                        componentName: 'FDraggable',
                        props: {
                            'v-model': {
                                type: 'JSExpression',
                                value: '[1, 2]',
                            },
                            'tag': 'div',
                            'item': {
                                name: 'default',
                                type: 'JSSlot',
                                params: ['slotProps'],
                                value: [
                                    {
                                        componentName: 'FText',
                                        props: {
                                            children: {
                                                type: 'JSExpression',
                                                value: 'slotProps.item',
                                            },
                                            tag: 'p',
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            ],
            group: '原子组件',
            category: '通用组件',
            priority: 0,
        },
        {
            title: '低代码组件',
            componentName: 'CompText',
            reference: {
                id: 'lcc-a',
                exportName: 'CompText',
                subName: '',
                destructuring: false,
                version: '0.1.0',
            },
            devMode: 'lowCode',
            props: [
            ],
            configure: {
                supports: {
                    style: true,
                },
                props: [
                    {
                        name: 'btnName',
                        title: '按钮文本',
                        setter: 'StringSetter',
                    },
                ],
            },
            snippets: [
                {
                    title: '低代码组件',
                    // screenshot:
                    //     'https://helios-allpublic-1257616148.cos.ap-shanghai.myqcloud.com/img/text.svg',
                    schema: {
                        componentName: 'CompText',
                        props: {
                        },
                    },
                },
            ],
            category: '基础元素',
            group: '低代码组件',
            priority: 0,
        },
        {
            title: '时间轴',
            description: '通过不同的配置，实现不同效果的时间轴',
            componentName: 'FTimeline',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.17',
                exportName: 'FTimeline',
                destructuring: true,
            },
            configure: {
                props: [
                    {
                        name: 'data',
                        title: '数据',
                        display: 'block',
                        setter: [
                            {
                                componentName: 'ArraySetter',
                                props: {
                                    itemSetter: {
                                        componentName: 'ObjectSetter',
                                        props: {
                                            items: [
                                                {
                                                    name: 'title',
                                                    title: '标题',
                                                    setter: 'StringSetter',
                                                },
                                                {
                                                    name: 'desc',
                                                    title: '辅助说明',
                                                    setter: 'StringSetter',
                                                },
                                                {
                                                    name: 'titlePosition',
                                                    title: '标题位置',
                                                    setter: {
                                                        componentName: 'RadioGroupSetter',
                                                        props: {
                                                            options: [
                                                                { value: 'start', label: '轴的上方' },
                                                                { value: 'end', label: '轴的下方' },
                                                            ],
                                                        },
                                                    },
                                                },
                                                {
                                                    name: 'icon',
                                                    title: '图标',
                                                    setter: [
                                                        {
                                                            componentName: 'SelectSetter',
                                                            props: {
                                                                options: [
                                                                    { value: 'info', label: '重要' },
                                                                    { value: 'success', label: '成功' },
                                                                    { value: 'warning', label: '警告' },
                                                                    { value: 'error', label: '错误' },
                                                                ],
                                                            },
                                                        },
                                                        'ColorSetter',
                                                        {
                                                            componentName: 'FunctionSetter',
                                                            props: {
                                                                placeholder: '({ index }) => <Icon />',
                                                            },
                                                        },
                                                    ],
                                                    defaultValue: 'info',
                                                },
                                            ],
                                        },
                                    },
                                    columns: [
                                        {
                                            name: 'title',
                                            title: '标题',
                                            setter: 'StringSetter',
                                        },
                                        {
                                            name: 'desc',
                                            title: '辅助说明',
                                            setter: 'StringSetter',
                                        },
                                    ],
                                },
                            },
                            'JsonSetter',
                        ],
                    },
                    {
                        name: 'direction',
                        title: '方向',
                        setter: {
                            componentName: 'SelectSetter',
                            props: {
                                options: [
                                    { value: 'column', label: '垂直向下' },
                                    { value: 'row', label: '水平向右' },
                                    { value: 'row-reverse', label: '水平向左' },
                                ],
                            },
                        },
                        defaultValue: 'column',
                    },
                    {
                        name: 'titlePosition',
                        title: '标题位置',
                        setter: {
                            componentName: 'SelectSetter',
                            props: {
                                options: [
                                    { value: 'start', label: '轴的上方' },
                                    { value: 'end', label: '轴的下方' },
                                    { value: 'alternate', label: '上下交叉' },
                                ],
                            },
                        },
                        defaultValue: 'end',
                    },
                    {
                        name: 'descPosition',
                        title: '辅助说明位置',
                        setter: {
                            componentName: 'SelectSetter',
                            props: {
                                options: [
                                    { value: 'under', label: '标题下方' },
                                    { value: 'inline', label: '标题同行' },
                                    { value: 'opposite', label: '标题不同侧' },
                                ],
                            },
                        },
                        defaultValue: 'under',
                    },
                    {
                        name: 'titleClass',
                        title: '标题样式类',
                        setter: {
                            componentName: 'StringSetter',
                            props: {
                                placeholder: 'my-class',
                            },
                        },
                    },
                    {
                        name: 'descClass',
                        title: '辅助样式类',
                        setter: {
                            componentName: 'StringSetter',
                            props: {
                                placeholder: 'my-class',
                            },
                        },
                    },
                    {
                        name: 'desc',
                        title: '自定义辅助说明',
                        setter: 'SlotSetter',
                        defaultValue: {
                            type: 'JSSlot',
                            name: 'desc',
                            value: [],
                        },
                    },
                    {
                        name: 'icon',
                        title: '自定义轴点图标',
                        setter: 'SlotSetter',
                        defaultValue: {
                            type: 'JSSlot',
                            name: 'icon',
                            value: [],
                        },
                    },
                ],
                supports: {
                    style: true,
                    class: true,
                },
            },
            snippets: [
                {
                    title: '时间轴',
                    schema: {
                        componentName: 'FTimeline',
                        props: {
                            data: [
                                {
                                    title: '2015-09-01',
                                    desc: 'Create a services site',
                                },
                                {
                                    title: '2015-09-01',
                                    desc: 'Solve initial network problems',
                                },
                                {
                                    title: '2015-09-01',
                                    desc: 'Technical testing',
                                },
                            ],
                        },
                    },
                },
            ],
            group: '原子组件',
            category: '信息展示',
            priority: 3,
        },
        {
            title: '文本',
            componentName: 'FText',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FText',
                destructuring: true,
            },
            props: [
                {
                    name: 'children',
                    propType: 'string',
                },
                {
                    name: 'type',
                    propType: 'string',
                },
                {
                    name: 'strong',
                    propType: 'bool',
                },
                {
                    name: 'italic',
                    propType: 'bool',
                },
                {
                    name: 'underline',
                    propType: 'bool',
                },
                {
                    name: 'delete',
                    propType: 'bool',
                },
                {
                    name: 'code',
                    propType: 'bool',
                },
                {
                    name: 'depth',
                    propType: 'string',
                },
            ],
            configure: {
                supports: {
                    style: true,
                    events: ['onClick', 'onError'],
                },
                props: [
                    {
                        name: 'children',
                        title: '文本内容',
                        setter: 'StringSetter',
                    },
                    {
                        name: 'type',
                        title: '排印类型',
                        setter: {
                            componentName: 'SelectSetter',
                            props: {
                                options: [
                                    {
                                        label: '默认',
                                        value: 'default',
                                    },
                                    {
                                        label: '成功',
                                        value: 'success',
                                    },
                                    {
                                        label: '信息',
                                        value: 'info',
                                    },
                                    {
                                        label: '警告',
                                        value: 'warning',
                                    },
                                    {
                                        label: '错误',
                                        value: 'error',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'default',
                    },
                    {
                        name: 'strong',
                        title: '加粗',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'italic',
                        title: '斜体',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'underline',
                        title: '下划线',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'delete',
                        title: '删除线',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'code',
                        title: '代码模式',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'depth',
                        title: '文字深度',
                        setter: {
                            componentName: 'RadioGroupSetter',
                            props: {
                                options: [
                                    {
                                        label: '1',
                                        value: '1',
                                    },
                                    {
                                        label: '2',
                                        value: '2',
                                    },
                                    {
                                        label: '3',
                                        value: '3',
                                    },
                                ],
                            },
                        },
                    },
                    {
                        name: 'tag',
                        title: 'DOM 标签',
                        setter: {
                            componentName: 'SelectSetter',
                            props: {
                                options: [
                                    {
                                        label: 'p',
                                        value: 'p',
                                    },
                                    {
                                        label: 'span',
                                        value: 'span',
                                    },
                                    {
                                        label: 'label',
                                        value: 'label',
                                    },
                                ],
                            },
                            defaultValue: 'span',
                        },
                    },
                ],
            },
            snippets: [
                {
                    title: '文本',
                    // screenshot:
                    //     'https://helios-allpublic-1257616148.cos.ap-shanghai.myqcloud.com/img/text.svg',
                    schema: {
                        componentName: 'FText',
                        props: {
                            children: '文本内容',
                        },
                    },
                },
            ],
            group: '原子组件',
            category: '基础元素',
            priority: 0,
        },
        {
            title: '卡片',
            componentName: 'FCard',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FCard',
                destructuring: true,
            },
            props: [
                {
                    name: 'header',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'node'],
                    },
                },
                {
                    name: 'size',
                    propType: {
                        type: 'oneOf',
                        value: ['small', 'middle', 'large'],
                    },
                },
                {
                    name: 'bordered',
                    propType: 'bool',
                },
                {
                    name: 'divider',
                    propType: 'bool',
                },
                {
                    name: 'shadow',
                    propType: {
                        type: 'oneOf',
                        value: ['always', 'never', 'hover'],
                    },
                },
                {
                    name: 'bodyStyle',
                    propType: 'object',
                },
            ],
            configure: {
                supports: {
                    style: true,
                    events: ['onClick'],
                },
                component: {
                    isContainer: true,
                },
                props: [
                    {
                        title: '卡片内容',
                        type: 'group',
                        extraProps: {
                            display: 'block',
                        },
                        items: [
                            {
                                name: 'header',
                                title: '标题',
                                setter: [
                                    {
                                        componentName: 'StringSetter',
                                    },
                                    {
                                        componentName: 'SlotSetter',
                                        defaultValue: {
                                            type: 'JSSlot',
                                            title: '头部',
                                            value: [],
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        type: 'group',
                        title: '卡片样式',
                        display: 'block',
                        items: [
                            {
                                name: 'size',
                                title: '卡片尺寸',
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
                                name: 'bordered',
                                title: '显示边框',
                                setter: 'BoolSetter',
                                defaultValue: true,
                            },
                            {
                                name: 'divider',
                                title: '显示分割线',
                                setter: 'BoolSetter',
                                defaultValue: true,
                            },
                            {
                                name: 'shadow',
                                title: '阴影效果',
                                setter: {
                                    componentName: 'RadioGroupSetter',
                                    props: {
                                        options: [
                                            {
                                                label: '总是',
                                                value: 'always',
                                            },
                                            {
                                                label: '没有',
                                                value: 'never',
                                            },
                                            {
                                                label: '悬浮显示',
                                                value: 'hover',
                                            },
                                        ],
                                    },
                                },
                                defaultValue: 'always',
                            },
                            {
                                name: 'bodyStyle',
                                title: '内容样式',
                                setter: 'StyleSetter',
                                display: 'popup',
                            },
                        ],
                    },
                ],
            },
            snippets: [
                {
                    // screenshot:
                    //     'https://helios-allpublic-1257616148.cos.ap-shanghai.myqcloud.com/img/card.png',
                    title: '卡片',
                    schema: {
                        componentName: 'FCard',
                        children: [],
                    },
                },
            ],
            group: '原子组件',
            category: '信息展示',
            priority: 0,
        },
        {
            title: '间距',
            componentName: 'FSpace',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FSpace',
                destructuring: true,
            },
            props: [
                {
                    name: 'align',
                    propType: 'string',
                },
                {
                    name: 'justify',
                    propType: 'string',
                },
                {
                    name: 'size',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'number'],
                    },
                },
                {
                    name: 'inline',
                    propType: 'bool',
                },
                {
                    name: 'vertical',
                    propType: 'bool',
                },
                {
                    name: 'wrap',
                    propType: 'bool',
                },
            ],
            configure: {
                supports: {
                    style: true,
                    events: ['onClick'],
                },
                component: {
                    isContainer: true,
                },
                props: [
                    {
                        name: 'align',
                        title: '交叉轴对齐方式',
                        setter: {
                            componentName: 'SelectSetter',
                            props: {
                                options: [
                                    {
                                        label: '起点对齐',
                                        value: 'start',
                                    },
                                    {
                                        label: '终点对齐',
                                        value: 'end',
                                    },
                                    {
                                        label: '居中对齐',
                                        value: 'center',
                                    },
                                    {
                                        label: '基线对齐',
                                        value: 'baseline',
                                    },
                                    {
                                        label: '铺满',
                                        value: 'stretch',
                                    },
                                ],
                            },
                        },
                    },
                    {
                        name: 'justify',
                        title: '主轴排列方式',
                        setter: {
                            componentName: 'SelectSetter',
                            props: {
                                options: [
                                    {
                                        label: '行首开始排列',
                                        value: 'start',
                                    },
                                    {
                                        label: '行尾开始排列',
                                        value: 'end',
                                    },
                                    {
                                        label: '向行中点排列',
                                        value: 'center',
                                    },
                                    {
                                        label: '均匀分配',
                                        value: 'space-around',
                                    },
                                    {
                                        label: '均匀分配-首尾对齐',
                                        value: 'space-between',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'start',
                    },
                    {
                        name: 'size',
                        title: '间距大小',
                        setter: [
                            {
                                componentName: 'SelectSetter',
                                props: {
                                    options: [
                                        {
                                            label: '超小',
                                            value: 'xsmall',
                                        },
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
                            'NumberSetter',
                        ],
                        defaultValue: 'small',
                    },
                    {
                        name: 'inline',
                        title: '是否为行内元素',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'vertical',
                        title: '是否垂直布局',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'wrap',
                        title: '是否超出换行',
                        setter: 'BoolSetter',
                        defaultValue: true,
                    },
                    {
                        name: 'itemStyle',
                        title: '节点样式',
                        display: 'popup',
                        setter: 'StyleSetter',
                    },
                ],
            },
            snippets: [
                {
                    // screenshot:
                    //     'https://helios-allpublic-1257616148.cos.ap-shanghai.myqcloud.com/img/space.svg',
                    title: '间距',
                    schema: {
                        componentName: 'FSpace',
                        children: [],
                    },
                },
            ],
            group: '原子组件',
            category: '布局组件',
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
        {
            title: '表单',
            componentName: 'FForm',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FForm',
                destructuring: true,
            },
            props: [
                {
                    name: 'disabled',
                    propType: 'bool',
                },
                {
                    name: 'layout',
                    propType: 'string',
                },
                {
                    name: 'showMessage',
                    propType: 'bool',
                },
                {
                    name: 'labelWidth',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'number'],
                    },
                },
                {
                    name: 'labelAlign',
                    propType: {
                        type: 'oneOf',
                        value: ['left', 'right'],
                    },
                },
                {
                    name: 'labelPlacement',
                    propType: {
                        type: 'oneOf',
                        value: ['left', 'top'],
                    },
                },
                {
                    name: 'model',
                    propType: 'object',
                },
                {
                    name: 'rules',
                    propType: 'object',
                },
            ],
            configure: {
                supports: {
                    style: true,
                    events: ['onSubmit'],
                    methods: ['validate', 'clearValidate', 'resetFields'],
                },
                component: {
                    isContainer: true,
                    nestingRule: {
                        childWhitelist: ['FFormItem'],
                    },
                },
                props: [
                    {
                        name: 'model',
                        title: '表项值对象',
                        setter: {
                            componentName: 'ExpressionSetter',
                            props: {
                                placeholder: 'formModel.value',
                            },
                        },
                    },
                    {
                        name: 'rules',
                        title: '规则对象',
                        setter: {
                            componentName: 'JsonSetter',
                            props: {
                                placeholder: JSON.stringify({ fileName: { required: true, message: '必填项' }, fileName2: [{ required: true, message: '必填项' }] }, null, 2),
                            },
                        },
                    },
                    {
                        name: 'disabled',
                        title: '是否禁用',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'layout',
                        title: '布局',
                        setter: {
                            componentName: 'RadioGroupSetter',
                            props: {
                                options: [
                                    {
                                        title: '垂直表单',
                                        value: 'horizontal',
                                    },
                                    {
                                        title: '行内表单',
                                        value: 'inline',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'horizontal',
                    },
                    {
                        name: 'labelWidth',
                        title: '标签宽度',
                        setter: ['StringSetter', 'NumberSetter'],
                    },
                    {
                        name: 'labelPosition',
                        title: '标签位置',
                        setter: {
                            componentName: 'RadioGroupSetter',
                            props: {
                                options: [
                                    {
                                        label: '左侧',
                                        value: 'left',
                                    },
                                    {
                                        label: '上侧',
                                        value: 'top',
                                    },
                                    {
                                        label: '右侧',
                                        value: 'right',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'left',
                    },
                    {
                        name: 'showMessage',
                        title: '显示校验信息',
                        setter: 'BoolSetter',
                        defaultValue: true,
                    },
                    {
                        display: 'block',
                        title: '行内表单',
                        type: 'group',
                        items: [
                            {
                                name: 'inlineItemWidth',
                                title: '列宽度',
                                setter: 'NumberSetter',
                            },
                            {
                                name: 'inlineItemGap',
                                title: '列间距',
                                setter: 'NumberSetter',
                                defaultValue: 11,
                            },
                            {
                                name: 'span',
                                title: '每列格数',
                                setter: 'NumberSetter',
                                defaultValue: 6,
                            },
                        ],
                        condition: (target) => {
                            const val = target.top.getPropValue('layout');
                            return val === 'inline';
                        },
                    },
                ],
            },
            snippets: [
                {
                    // screenshot:
                    //     'https://helios-allpublic-1257616148.cos.ap-shanghai.myqcloud.com/img/form.png',
                    title: '表单容器',
                    schema: {
                        componentName: 'FForm',
                        props: {
                            labelWidth: 80,
                        },
                        children: [
                            {
                                componentName: 'FFormItem',
                                props: {
                                    label: '用户名',
                                },
                                children: [
                                    {
                                        componentName: 'FInput',
                                        props: {
                                            placeholder: '请输入用户名',
                                        },
                                    },
                                ],
                            },
                            {
                                componentName: 'FFormItem',
                                props: {
                                    label: '密码',
                                },
                                children: [
                                    {
                                        componentName: 'FInput',
                                        props: {
                                            type: 'password',
                                            placeholder: '请输入密码',
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
            ],
            group: '精选组件',
            category: '数据录入',
            priority: 0,
        },
        {
            title: '表单项',
            category: '数据录入',
            componentName: 'FFormItem',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FFormItem',
                destructuring: true,
            },
            props: [
                {
                    name: 'label',
                    propType: 'string',
                },
                {
                    name: 'prop',
                    propType: 'string',
                },
                {
                    name: 'rules',
                    propType: 'array',
                },
                {
                    name: 'labelWidth',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'number'],
                    },
                },
                {
                    name: 'showMessage',
                    propType: 'bool',
                },
                {
                    name: 'span',
                    propType: 'number',
                },
            ],
            configure: {
                component: {
                    isContainer: true,
                    nestingRule: {
                        parentWhitelist: 'FForm',
                    },
                },
                supports: {
                    style: true,
                    methods: ['validate'],
                },
                props: [
                    {
                        name: 'prop',
                        title: '值路径',
                        setter: 'StringSetter',
                    },
                    {
                        type: 'group',
                        title: '标签设置',
                        extraProps: {
                            display: 'block',
                        },
                        items: [
                            {
                                name: 'label',
                                title: '标签内容',
                                setter: 'StringSetter',
                            },
                            {
                                name: 'labelWidth',
                                title: '标签宽度',
                                setter: [
                                    'StringSetter',
                                    'NumberSetter',
                                ],
                                defaultValue: 'auto',
                            },
                        ],
                    },
                    {
                        type: 'group',
                        title: '校验设置',
                        extraProps: {
                            display: 'block',
                        },
                        items: [
                            {
                                name: 'rules',
                                title: '校验规则',
                                setter: 'JsonSetter',
                            },
                            {
                                name: 'showMessage',
                                title: '是否显示错误信息',
                                setter: 'BoolSetter',
                                defaultValue: true,
                            },
                        ],
                    },
                    {
                        type: 'group',
                        title: '其他',
                        display: 'block',
                        items: [
                            {
                                name: 'span',
                                title: '占据格数',
                                setter: 'NumberSetter',
                                defaultValue: 6,
                            },
                        ],
                    },
                ],
            },
            snippets: [
                {
                    // screenshot:
                    //     'https://helios-allpublic-1257616148.cos.ap-shanghai.myqcloud.com/img/form.png',
                    title: '表单项',
                    schema: {
                        componentName: 'FFormItem',
                        props: {
                            label: 'label',
                        },
                        children: [],
                    },
                },
            ],
            group: '精选组件',
            priority: 0,
        },
        {
            title: '文本输入',
            componentName: 'FInput',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FInput',
                destructuring: true,
            },
            props: [
                {
                    name: 'v-model',
                    propType: 'string',
                },
                {
                    name: 'disabled',
                    propType: 'bool',
                },
                {
                    name: 'clearable',
                    propType: 'bool',
                },
                {
                    name: 'maxlength',
                    propType: 'number',
                },
                {
                    name: 'placeholder',
                    propType: 'string',
                },
                {
                    name: 'showPassword',
                    propType: 'bool',
                },
                {
                    name: 'rows',
                    propType: 'number',
                },
                {
                    name: 'showWordLimit',
                    propType: 'bool',
                },
                {
                    name: 'autosize',
                    propType: {
                        type: 'oneOfType',
                        value: ['bool', 'object'],
                    },
                },
            ],
            configure: {
                props: [
                    {
                        name: 'v-model',
                        title: '绑定变量',
                        setter: 'VariableSetter',
                    },
                    {
                        name: 'maxlength',
                        title: '最大长度',
                        setter: 'NumberSetter',
                    },
                    {
                        name: 'placeholder',
                        title: '输入提示',
                        setter: 'StringSetter',
                        defaultValue: '请输入',
                    },
                    {
                        name: 'rows',
                        title: '行数',
                        setter: 'NumberSetter',
                        defaultValue: 2,
                        condition: (target) => {
                            const val = target.top.getPropValue('type');
                            return val === 'textarea';
                        },
                    },
                    {
                        name: 'autosize',
                        title: '高度自适应',
                        setter: {
                            componentName: 'BoolSetter',
                            props: {
                                extraSetter: {
                                    componentName: 'ObjectSetter',
                                    props: {
                                        items: [
                                            {
                                                name: 'minRows',
                                                title: '最小行数',
                                                setter: 'NumberSetter',
                                            },
                                            {
                                                name: 'maxRows',
                                                title: '最大行数',
                                                setter: 'NumberSetter',
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                        defaultValue: false,
                        condition: (target) => {
                            const val = target.top.getPropValue('type');
                            return val === 'textarea';
                        },
                    },
                    {
                        name: 'resize',
                        title: '缩放',
                        setter: {
                            componentName: 'SelectSetter',
                            props: {
                                options: [
                                    {
                                        label: '水平方向',
                                        value: 'horizontal',
                                    },
                                    {
                                        label: '垂直方向',
                                        value: 'vertical',
                                    },
                                    {
                                        label: '水平垂直方向',
                                        value: 'both',
                                    },
                                    {
                                        label: '禁止',
                                        value: 'none',
                                    },
                                ],
                            },
                        },
                        condition: (target) => {
                            const val = target.top.getPropValue('type');
                            return val === 'textarea';
                        },
                    },
                    {
                        name: 'showWordLimit',
                        title: '是否统计',
                        setter: 'BoolSetter',
                        condition: (target) => {
                            const val = target.top.getPropValue('type');
                            return val === 'textarea';
                        },
                        defaultValue: false,
                    },
                    {
                        name: 'disabled',
                        title: '是否禁用',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'clearable',
                        title: '可清空',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'showPassword',
                        title: '显示密码图标',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        type: 'group',
                        title: '自定义前缀后缀',
                        display: 'block',
                        items: [
                            {
                                name: 'prefix',
                                title: '前缀',
                                setter: 'SlotSetter',
                            },
                            {
                                name: 'suffix',
                                title: '后缀',
                                setter: 'SlotSetter',
                            },
                            {
                                name: 'prepend',
                                title: '前置内容',
                                setter: 'SlotSetter',
                            },
                            {
                                name: 'append',
                                title: '后置内容',
                                setter: 'SlotSetter',
                            },
                        ],
                    },
                ],
                supports: {
                    events: [
                        'onChange',
                        'onInput',
                        'onFocus',
                        'onBlur',
                        'onClear',
                        'onKeydown',
                    ],
                    style: true,
                },
            },
            snippets: [
                {
                    title: '文本输入框',
                    schema: {
                        componentName: 'FInput',
                        props: {},
                    },
                },
                {
                    title: '密码输入框',
                    schema: {
                        componentName: 'FInput',
                        props: {
                            type: 'password',
                            showPassword: true,
                        },
                    },
                },
                {
                    title: '文本域输入框',
                    schema: {
                        componentName: 'FInput',
                        props: {
                            type: 'textarea',
                        },
                    },
                },
            ],
            group: '原子组件',
            category: '数据录入',
            priority: 0,
        },
        {
            title: '数字输入框',
            componentName: 'FInputNumber',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FInputNumber',
                destructuring: true,
            },
            props: [
                {
                    name: 'v-model',
                    propType: 'number',
                    title: '输入值',
                },
                {
                    name: 'mix',
                    propType: 'number',
                    title: '最小值',
                },
                {
                    name: 'max',
                    propType: 'number',
                    title: '最大值',
                },
                {
                    name: 'step',
                    propType: 'number',
                    defaultValue: 1,
                    title: '计数器步长',
                },
                {
                    name: 'placeholder',
                    propType: 'string',
                    title: '输入提示',
                },
                {
                    name: 'precision',
                    propType: 'number',
                    title: '输入值精度',
                },
                {
                    name: 'disabled',
                    propType: 'bool',
                    defaultValue: false,
                    title: '是否禁用',
                },
            ],
            configure: {
                supports: {
                    events: [
                        'onFocus',
                        'onBlur',
                        'onChange',
                    ],
                    style: true,
                },
                props: [
                    {
                        name: 'v-model',
                        title: '绑定变量',
                        setter: 'VariableSetter',
                    },
                    {
                        name: 'mix',
                        title: '最小值',
                        setter: 'NumberSetter',
                    },
                    {
                        name: 'max',
                        title: '最大值',
                        setter: 'NumberSetter',
                    },
                    {
                        name: 'precision',
                        title: '值精度',
                        setter: 'NumberSetter',
                    },
                    {
                        name: 'step',
                        title: '计数器步长',
                        setter: 'NumberSetter',
                        defaultValue: 1,
                    },
                    {
                        name: 'placeholder',
                        title: '输入提示',
                        setter: 'StringSetter',
                    },
                    {
                        name: 'disabled',
                        title: '是否禁用',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        type: 'group',
                        title: '自定义前缀后缀',
                        display: 'block',
                        items: [
                            {
                                name: 'prefix',
                                title: '前缀',
                                setter: 'SlotSetter',
                            },
                            {
                                name: 'suffix',
                                title: '后缀',
                                setter: 'SlotSetter',
                            },
                        ],
                    },
                ],
            },
            snippets: [
                {
                    title: '数字输入框',
                    schema: {
                        componentName: 'FInputNumber',
                        props: {},
                    },
                },
            ],
            group: '原子组件',
            category: '数据录入',
            priority: 0,
        },
        {
            title: '选择器',
            componentName: 'FSelect',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FSelect',
                destructuring: true,
            },
            props: [
                {
                    name: 'options',
                    propType: {
                        type: 'arrayOf',
                        value: {
                            type: 'exact',
                            value: [
                                {
                                    name: 'value',
                                    propType: {
                                        type: 'oneOfType',
                                        value: ['string', 'number'],
                                    },
                                },
                                {
                                    name: 'label',
                                    propType: 'string',
                                },
                            ],
                        },
                    },
                },
                {
                    name: 'clearable',
                    propType: 'bool',
                },
                {
                    name: 'disabled',
                    propType: 'bool',
                },
                {
                    name: 'collapseTags',
                    propType: 'bool',
                },
                {
                    name: 'collapseTagsLimit',
                    propType: 'number',
                },
                {
                    name: 'tagBordered',
                    propType: 'bool',
                },
                {
                    name: 'emptyText',
                    propType: 'string',
                },
                {
                    name: 'appendToContainer',
                    propType: 'bool',
                },
                {
                    name: 'getContainer',
                    propType: 'func',
                },
                {
                    name: 'multiple',
                    propType: 'bool',
                },
                {
                    name: 'multipleLimit',
                    propType: 'number',
                },
                {
                    name: 'placeholder',
                    propType: 'string',
                },
                {
                    name: 'v-model',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'number'],
                    },
                },
                {
                    name: 'filterable',
                    propType: 'bool',
                },
                {
                    name: 'filter',
                    propType: 'func',
                },
                {
                    name: 'tag',
                    propType: 'bool',
                },
                {
                    name: 'remote',
                    propType: 'bool',
                },
                {
                    name: 'valueField',
                    propType: 'string',
                },
                {
                    name: 'labelField',
                    propType: 'string',
                },
                {
                    name: 'popperClass',
                    propType: 'string',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'v-model',
                        title: '绑定变量',
                        setter: 'VariableSetter',
                    },
                    {
                        name: 'options',
                        title: '选项',
                        display: 'block',
                        setter: [
                            {
                                componentName: 'ArraySetter',
                                props: {
                                    itemSetter: {
                                        componentName: 'ObjectSetter',
                                        props: {
                                            items: [
                                                {
                                                    name: 'value',
                                                    title: '选项值',
                                                    setter: [
                                                        'StringSetter',
                                                        'NumberSetter',
                                                    ],
                                                },
                                                {
                                                    name: 'label',
                                                    title: '选项名',
                                                    setter: 'StringSetter',
                                                },
                                            ],
                                        },
                                    },
                                    columns: [
                                        'value',
                                        'label',
                                    ],
                                },
                            },
                            'JsonSetter',
                        ],
                    },
                    {
                        title: '选项配置',
                        type: 'group',
                        extraProps: {
                            display: 'block',
                        },
                        items: [
                            {
                                name: 'valueField',
                                title: 'value字段',
                                setter: 'StringSetter',
                                defaultValue: 'value',
                            },
                            {
                                name: 'labelField',
                                title: 'label字段',
                                setter: 'StringSetter',
                                defaultValue: 'label',
                            },
                        ],
                    },
                    {
                        title: '基础配置',
                        type: 'group',
                        extraProps: {
                            display: 'block',
                        },
                        items: [
                            {
                                name: 'placeholder',
                                title: '未选择提示语',
                                setter: 'StringSetter',
                                defaultValue: '请选择',
                            },
                            {
                                name: 'emptyText',
                                title: '选项为空提示语',
                                setter: 'StringSetter',
                                defaultValue: '无数据',
                            },
                            {
                                name: 'clearable',
                                title: '可清除',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'disabled',
                                title: '禁用',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'popperClass',
                                title: '弹出框样式',
                                setter: 'StringSetter',
                            },
                        ],
                    },
                    {
                        title: '多选配置',
                        type: 'group',
                        extraProps: {
                            display: 'block',
                        },
                        items: [
                            {
                                name: 'multiple',
                                title: '是否多选',
                                setter: 'BoolSetter',
                            },
                            {
                                name: 'multipleLimit',
                                title: '最多选几个',
                                setter: 'NumberSetter',
                            },
                            {
                                name: 'collapseTags',
                                title: '是否多选折叠展示',
                                setter: 'BoolSetter',
                            },
                            {
                                name: 'collapseTagsLimit',
                                title: '超出几个折叠',
                                setter: 'NumberSetter',
                                defaultValue: 1,
                            },
                            {
                                name: 'tagBordered',
                                title: '选中项展示是否有边框',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                        ],
                    },
                    {
                        title: '功能配置',
                        type: 'group',
                        extraProps: {
                            display: 'block',
                        },
                        items: [
                            {
                                name: 'filterable',
                                title: '是否支持过滤选项',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'filter',
                                title: '过滤函数',
                                setter: {
                                    componentName: 'FunctionSetter',
                                    props: {
                                        placeholder: 'function(pattern, option) {\n\t//todo filter\n\treturn true;\n}',
                                    },
                                },

                            },
                            {
                                name: 'tag',
                                title: '是否支持创建新选项',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'remote',
                                title: '是否远程搜索',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                        ],
                    },
                    {
                        title: '挂载配置',
                        type: 'group',
                        extraProps: {
                            display: 'block',
                        },
                        items: [
                            {
                                name: 'appendToContainer',
                                title: '弹窗挂载到外部节点',
                                setter: 'BoolSetter',
                                defaultValue: true,
                            },
                            {
                                name: 'getContainer',
                                title: '挂载容器',
                                setter: 'FunctionSetter',
                                defaultValue: () => {
                                    return function () {
                                        return document.body;
                                    };
                                },
                            },
                        ],
                    },
                ],
                supports: {
                    events: [
                        'onChange',
                        'onVisibleChange',
                        'onRemoveTag',
                        'onBlur',
                        'onFocus',
                        'onClear',
                        'onScroll',
                        'onSearch',
                    ],
                    class: true,
                    style: true,
                },
            },
            snippets: [
                {
                    title: '选择器',
                    schema: {
                        componentName: 'FSelect',
                        props: {
                            options: [
                                {
                                    value: 'HuBei',
                                    label: '湖北省',
                                },
                                {
                                    value: 'GuangDong',
                                    label: '广东省',
                                },
                            ],
                        },
                    },
                },
            ],
            group: '原子组件',
            category: '数据录入',
            priority: 0,
        },
        {
            title: '多选框组',
            componentName: 'FCheckboxGroup',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FCheckboxGroup',
                destructuring: true,
            },
            group: '原子组件',
            category: '数据录入',
            priority: 0,
            props: [
                {
                    name: 'v-model',
                    propType: 'array',
                },
                {
                    name: 'vertical',
                    propType: 'bool',
                },
                {
                    name: 'disabled',
                    propType: 'bool',
                },
                {
                    name: 'options',
                    propType: 'array',
                },
                {
                    name: 'valueField',
                    propType: 'string',
                },
                {
                    name: 'labelField',
                    propType: 'string',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'v-model',
                        title: '绑定变量',
                        setter: 'VariableSetter',
                    },
                    {
                        name: 'vertical',
                        title: '垂直排列',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'disabled',
                        title: '是否禁用',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'options',
                        title: '选项配置',
                        extraProps: {
                            display: 'block',
                        },
                        setter: [
                            {
                                componentName: 'ArraySetter',
                                props: {
                                    itemSetter: {
                                        componentName: 'ObjectSetter',
                                        props: {
                                            items: [
                                                {
                                                    name: 'value',
                                                    title: '选项值',
                                                    setter: [
                                                        'StringSetter',
                                                        'NumberSetter',
                                                    ],
                                                },
                                                {
                                                    name: 'label',
                                                    title: '选项名',
                                                    setter: 'StringSetter',
                                                },
                                                {
                                                    name: 'disabled',
                                                    title: '是否禁用',
                                                    setter: 'BoolSetter',
                                                },
                                            ],
                                        },
                                    },
                                    columns: [
                                        {
                                            name: 'value',
                                            title: '选项值',
                                            setter: [
                                                'StringSetter',
                                                'NumberSetter',
                                            ],
                                        },
                                        {
                                            name: 'label',
                                            title: '选项名',
                                            setter: 'StringSetter',
                                        },
                                    ],
                                },
                            },
                            'JsonSetter',
                        ],
                    },
                ],
                supports: {
                    events: ['onChange'],
                    class: true,
                    style: true,
                },
            },
            snippets: [
                {
                    title: '多选框组',
                    schema: {
                        componentName: 'FCheckboxGroup',
                        props: {
                            options: [
                                {
                                    value: 1,
                                    label: '1',
                                },
                                {
                                    value: 2,
                                    label: '2',
                                },
                            ],
                        },
                    },
                },
            ],
        },
        {
            title: '单选组',
            componentName: 'FRadioGroup',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FRadioGroup',
                destructuring: true,
            },
            group: '原子组件',
            category: '数据录入',
            priority: 0,
            props: [
                {
                    name: 'v-model',
                    propType: 'array',
                },
                {
                    name: 'vertical',
                    propType: 'bool',
                },
                {
                    name: 'disabled',
                    propType: 'bool',
                },
                {
                    name: 'cancelable',
                    propType: 'bool',
                },
                {
                    name: 'options',
                    propType: 'array',
                },
                {
                    name: 'valueField',
                    propType: 'string',
                },
                {
                    name: 'labelField',
                    propType: 'string',
                },
                {
                    name: 'optionType',
                    propType: 'string',
                },
                {
                    name: 'type',
                    propType: 'string',
                },
                {
                    name: 'size',
                    propType: 'string',
                },
                {
                    name: 'bordered',
                    propType: 'bool',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'v-model',
                        title: '绑定变量',
                        setter: 'VariableSetter',
                    },
                    {
                        name: 'vertical',
                        title: '垂直排列',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'disabled',
                        title: '是否禁用',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'cancelable',
                        title: '是否可取消',
                        setter: 'BoolSetter',
                        defaultValue: true,
                    },
                    {
                        name: 'options',
                        title: '选项配置',
                        display: 'block',
                        setter: [
                            {
                                componentName: 'ArraySetter',
                                props: {
                                    itemSetter: {
                                        componentName: 'ObjectSetter',
                                        props: {
                                            items: [
                                                {
                                                    name: 'value',
                                                    title: '选项值',
                                                    setter: [
                                                        'StringSetter',
                                                        'NumberSetter',
                                                    ],
                                                },
                                                {
                                                    name: 'label',
                                                    title: '选项名',
                                                    setter: 'StringSetter',
                                                },
                                                {
                                                    name: 'disabled',
                                                    title: '是否禁用',
                                                    setter: 'BoolSetter',
                                                },
                                            ],
                                        },
                                    },
                                    columns: [
                                        {
                                            name: 'value',
                                            title: '选项值',
                                            setter: [
                                                'StringSetter',
                                                'NumberSetter',
                                            ],
                                        },
                                        {
                                            name: 'label',
                                            title: '选项名',
                                            setter: 'StringSetter',
                                        },
                                    ],
                                },
                            },
                            'JsonSetter',
                        ],
                    },
                    {
                        title: '类型配置',
                        type: 'group',
                        display: 'block',
                        items: [
                            {
                                name: 'optionType',
                                title: '选项类型',
                                setter: {
                                    componentName: 'RadioGroupSetter',
                                    props: {
                                        options: [
                                            {
                                                value: 'default',
                                                label: '单选框',
                                            },
                                            {
                                                value: 'button',
                                                label: '按钮',
                                            },
                                        ],
                                    },
                                },
                                defaultValue: 'default',
                            },
                            {
                                name: 'type',
                                title: '按钮样式',
                                setter: {
                                    componentName: 'RadioGroupSetter',
                                    props: {
                                        options: [
                                            {
                                                value: 'default',
                                                label: '默认',
                                            },
                                            {
                                                value: 'primary',
                                                label: '重要',
                                            },
                                        ],
                                    },
                                },
                                defaultValue: 'default',
                                condition: (target) => {
                                    const val
                                        = target.top.getPropValue('optionType');
                                    return val === 'button';
                                },
                            },
                            {
                                name: 'size',
                                title: '按钮大小',
                                setter: {
                                    componentName: 'SelectSetter',
                                    props: {
                                        options: [
                                            {
                                                value: 'small',
                                                label: '小',
                                            },
                                            {
                                                value: 'middle',
                                                label: '中',
                                            },
                                        ],
                                    },
                                },
                                defaultValue: 'middle',
                                condition: (target) => {
                                    const val
                                        = target.top.getPropValue('optionType');
                                    return val === 'button';
                                },
                            },
                            {
                                name: 'bordered',
                                title: '按钮是否边框',
                                setter: 'BoolSetter',
                                defaultValue: true,
                                condition: (target) => {
                                    const val
                                        = target.top.getPropValue('optionType');
                                    return val === 'button';
                                },
                            },
                        ],
                    },
                ],
                component: {},
                supports: {
                    events: ['onChange'],
                    class: true,
                    style: true,
                },
            },
            snippets: [
                {
                    title: '单选组',
                    schema: {
                        componentName: 'FRadioGroup',
                        props: {
                            options: [
                                {
                                    value: 1,
                                    label: '1',
                                },
                                {
                                    value: 2,
                                    label: '2',
                                },
                            ],
                        },
                    },
                },
            ],
        },
        {
            title: '多选框',
            componentName: 'FCheckbox',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FCheckbox',
                destructuring: true,
            },
            group: '原子组件',
            category: '数据录入',
            priority: 0,
            props: [
                {
                    name: 'v-model',
                    propType: 'bool',
                },
                {
                    name: 'value',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'number', 'bool'],
                    },
                },
                {
                    name: 'label',
                    propType: 'string',
                },
                {
                    name: 'disabled',
                    propType: 'bool',
                },
                {
                    name: 'indeterminate',
                    propType: 'bool',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'v-model',
                        title: '绑定变量',
                        setter: 'VariableSetter',
                    },
                    {
                        name: 'value',
                        title: '内容',
                        setter: ['StringSetter', 'NumberSetter'],
                        condition: (target) => {
                            return (
                                target.top.getNode().parent.componentName
                                === 'FCheckboxGroup'
                            );
                        },
                    },
                    {
                        name: 'label',
                        title: '描述',
                        setter: 'StringSetter',
                    },
                    {
                        name: 'disabled',
                        title: '禁用',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'indeterminate',
                        title: '部分选中',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                ],
                component: {},
                supports: {
                    events: ['onChange'],
                    class: true,
                    style: true,
                },
            },
            snippets: [
                {
                    title: '多选框',
                    schema: {
                        componentName: 'FCheckbox',
                        props: {},
                    },
                },
            ],
        },
        {
            title: '单选框',
            componentName: 'FRadio',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FRadio',
                destructuring: true,
            },
            group: '原子组件',
            category: '数据录入',
            priority: 0,
            props: [
                {
                    name: 'v-model',
                    propType: 'bool',
                },
                {
                    name: 'value',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'number', 'bool'],
                    },
                },
                {
                    name: 'label',
                    propType: 'string',
                },
                {
                    name: 'disabled',
                    propType: 'bool',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'v-model',
                        title: '绑定变量',
                        setter: 'VariableSetter',
                    },
                    {
                        name: 'value',
                        title: '内容',
                        setter: ['StringSetter', 'NumberSetter'],
                        condition: (target) => {
                            return (
                                target.top.getNode().parent.componentName
                                === 'FRadioGroup'
                            );
                        },
                    },
                    {
                        name: 'label',
                        title: '描述',
                        setter: 'StringSetter',
                    },
                    {
                        name: 'disabled',
                        title: '禁用',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                ],
                component: {},
                supports: {
                    events: ['onChange'],
                    class: true,
                    style: true,
                },
            },
            snippets: [
                {
                    title: '单选框',
                    schema: {
                        componentName: 'FRadio',
                        props: {
                            label: '单选框',
                        },
                    },
                },
            ],
        },
        {
            title: '分割线',
            componentName: 'FDivider',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FDivider',
                destructuring: true,
            },
            props: [
                {
                    name: 'children',
                    title: '标题',
                    propType: 'string',
                },
                {
                    name: 'vertical',
                    title: '是否垂直方向',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'titlePlacement',
                    title: '文字位置',
                    propType: {
                        type: 'oneOf',
                        value: ['center', 'left', 'right'],
                    },
                    defaultValue: 'center',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'children',
                        title: '标题',
                        setter: 'StringSetter',
                    },
                    {
                        name: 'titlePlacement',
                        title: '文字位置',
                        setter: {
                            componentName: 'RadioGroupSetter',
                            props: {
                                options: [
                                    {
                                        value: 'left',
                                        label: '起点',
                                    },
                                    {
                                        value: 'center',
                                        label: '中间',
                                    },
                                    {
                                        value: 'right',
                                        label: '终点',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'center',
                    },
                    {
                        name: 'vertical',
                        title: '是否垂直方向',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                ],
                supports: {
                    style: true,
                    class: true,
                },
            },
            snippets: [
                {
                    title: '分割线',
                    schema: {
                        componentName: 'FDivider',
                        props: {},
                    },
                },
            ],
            group: '原子组件',
            category: '布局组件',
            priority: 0,
        },
        {
            title: '文本省略',
            componentName: 'FEllipsis',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FEllipsis',
                destructuring: true,
            },
            props: [
                {
                    name: 'line',
                    propType: 'number',
                },
                {
                    name: 'content',
                    title: '文本内容',
                    propType: 'string',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'content',
                        title: '文本内容',
                        setter: 'StringSetter',
                    },
                    {
                        name: 'line',
                        title: '多行省略',
                        setter: 'NumberSetter',
                        defaultValue: 1,
                    },
                    {
                        name: 'tooltipSlot',
                        title: '自定义弹出内容',
                        setter: 'SlotSetter',
                        defaultValue: {
                            type: 'JSSlot',
                            title: '自定义弹出内容',
                            name: 'tooltip',
                            params: [],
                            value: [],
                        },
                    },
                ],
                supports: {
                    style: true,
                },
            },
            snippets: [
                {
                    title: '文本省略',
                    schema: {
                        componentName: 'FEllipsis',
                        props: {
                            content: '文本内容',
                            style: {
                                width: '50px',
                            },
                        },
                    },
                },
            ],
            group: '原子组件',
            category: '基础元素',
            priority: 0,
        },
        {
            title: '布局容器',
            componentName: 'FLayout',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FLayout',
                destructuring: true,
            },
            props: [
                {
                    name: 'embedded',
                    propType: 'bool',
                },
                {
                    name: 'fixed',
                    propType: 'bool',
                },
                {
                    name: 'containerClass',
                    propType: 'string',
                },
                {
                    name: 'containerStyle',
                    propType: 'object',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'embedded',
                        title: '反色背景',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'fixed',
                        title: '浮动模式',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'containerStyle',
                        title: '内容样式',
                        setter: 'StyleSetter',
                        display: 'popup',
                    },
                ],
                component: {
                    isContainer: true,
                    nestingRule: {
                        childWhitelist: [
                            'FHeader',
                            'FAside',
                            'FMain',
                            'FFooter',
                            'FLayout',
                        ],
                    },
                },
                supports: {
                    style: true,
                },
            },
            snippets: [

                {
                    title: '混合布局',
                    schema: {
                        componentName: 'FLayout',
                        props: {
                            fixed: true,
                        },
                        children: [
                            {
                                componentName: 'FAside',
                            },
                            {
                                componentName: 'FLayout',
                                children: [
                                    {
                                        componentName: 'FHeader',
                                    },
                                    {
                                        componentName: 'FMain',
                                    },
                                    {
                                        componentName: 'FFooter',
                                    },
                                ],
                            },
                        ],
                    },
                    group: '精选组件',
                    category: '布局组件',
                },
                {
                    title: '左右布局',
                    schema: {
                        componentName: 'FLayout',
                        props: {
                            fixed: true,
                        },
                        children: [
                            {
                                componentName: 'FAside',
                            },
                            {
                                componentName: 'FMain',
                            },
                        ],
                    },
                    group: '精选组件',
                    category: '布局组件',
                },
                {
                    title: '上下布局',
                    schema: {
                        componentName: 'FLayout',
                        props: {
                            fixed: true,
                        },
                        children: [
                            {
                                componentName: 'FHeader',
                            },
                            {
                                componentName: 'FMain',
                            },
                            {
                                componentName: 'FFooter',
                            },
                        ],
                    },
                    group: '精选组件',
                    category: '布局组件',
                },
            ],
            group: '原子组件',
            category: '布局组件',
            priority: 0,
        },
        {
            title: '容器头部',
            componentName: 'FHeader',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FHeader',
                destructuring: true,
            },
            props: [
                {
                    name: 'fixed',
                    propType: 'bool',
                },
                {
                    name: 'bordered',
                    propType: 'bool',
                },
                {
                    name: 'inverted',
                    propType: 'bool',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'fixed',
                        title: '浮动模式',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'bordered',
                        title: '边框',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'inverted',
                        title: '深色',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                ],
                component: {
                    isContainer: true,
                    nestingRule: {
                        parentWhitelist: 'FLayout',
                    },
                },
                supports: {
                    style: true,
                },
            },
            snippets: [

            ],
            group: '原子组件',
            category: '布局组件',
            priority: 0,
        },
        {
            title: '容器侧边栏',
            componentName: 'FAside',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FAside',
                destructuring: true,
            },
            props: [
                {
                    name: 'fixed',
                    propType: 'bool',
                },
                {
                    name: 'bordered',
                    propType: 'bool',
                },
                {
                    name: 'inverted',
                    propType: 'bool',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'fixed',
                        title: '浮动模式',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'bordered',
                        title: '边框',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'inverted',
                        title: '深色',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                ],
                component: {
                    isContainer: true,
                    nestingRule: {
                        parentWhitelist: 'FLayout',
                    },
                },
                supports: {
                    style: true,
                },
            },
            snippets: [

            ],
            group: '原子组件',
            category: '布局组件',
            priority: 0,
        },
        {
            title: '容器主体',
            componentName: 'FMain',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FMain',
                destructuring: true,
            },
            props: [
                {
                    name: 'embedded',
                    propType: 'bool',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'embedded',
                        title: '反色背景',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                ],
                component: {
                    isContainer: true,
                    nestingRule: {
                        parentWhitelist: 'FLayout',
                    },
                },
                supports: {
                    style: true,
                },
            },
            snippets: [

            ],
            group: '原子组件',
            category: '布局组件',
            priority: 0,
        },
        {
            title: '容器底部',
            componentName: 'FFooter',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FFooter',
                destructuring: true,
            },
            props: [
                {
                    name: 'fixed',
                    propType: 'bool',
                },
                {
                    name: 'bordered',
                    propType: 'bool',
                },
                {
                    name: 'embedded',
                    propType: 'bool',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'fixed',
                        title: '浮动模式',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'bordered',
                        title: '边框',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'embedded',
                        title: '反色背景',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                ],
                component: {
                    isContainer: true,
                    nestingRule: {
                        parentWhitelist: 'FLayout',
                    },
                },
                supports: {
                    style: true,
                },
            },
            snippets: [

            ],
            group: '原子组件',
            category: '布局组件',
            priority: 0,
        },
        {
            title: '下拉菜单',
            componentName: 'FDropdown',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FDropdown',
                destructuring: true,
            },
            props: [
                {
                    name: 'options',
                    title: '下拉选项',
                    propType: {
                        type: 'arrayOf',
                        value: {
                            type: 'exact',
                            value: [
                                {
                                    name: 'value',
                                    propType: {
                                        type: 'oneOfType',
                                        value: ['string', 'number'],
                                    },
                                },
                                {
                                    name: 'label',
                                    propType: {
                                        type: 'oneOfType',
                                        value: ['string', 'func'],
                                    },
                                },
                                {
                                    name: 'disabled',
                                    propType: 'bool',
                                },
                                {
                                    name: 'icon',
                                    propType: 'func',
                                },
                            ],
                        },
                    },
                },
                {
                    name: 'trigger',
                    title: '触发方式',
                    propType: 'string',
                },
                {
                    name: 'placement',
                    propType: 'string',
                },
                {
                    name: 'offset',
                    propType: 'string',
                },
                {
                    name: 'disabled',
                    propType: 'bool',
                },
                {
                    name: 'arrow',
                    propType: 'bool',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'options',
                        title: '下拉选项',
                        display: 'block',
                        setter: {
                            componentName: 'ArraySetter',
                            props: {
                                itemSetter: {
                                    componentName: 'ObjectSetter',
                                    props: {
                                        items: [
                                            {
                                                name: 'label',
                                                title: '选项名',
                                                setter: 'StringSetter',
                                            },
                                            {
                                                name: 'value',
                                                title: '选项值',
                                                setter: [
                                                    'StringSetter',
                                                    'NumberSetter',
                                                ],
                                            },
                                            {
                                                name: 'disabled',
                                                title: '是否禁用',
                                                setter: 'BoolSetter',
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
                                },
                                columns: [
                                    {
                                        name: 'label',
                                        title: '选项名',
                                        setter: 'StringSetter',
                                    },
                                    {
                                        name: 'value',
                                        title: '选项值',
                                        setter: [
                                            'StringSetter',
                                            'NumberSetter',
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        title: '功能',
                        type: 'group',
                        display: 'block',
                        items: [
                            {
                                name: 'trigger',
                                title: '触发方式',
                                setter: {
                                    componentName: 'SelectSetter',
                                    props: {
                                        options: [
                                            {
                                                value: 'hover',
                                                label: '鼠标悬浮',
                                            },
                                            {
                                                value: 'click',
                                                label: '鼠标左击',
                                            },
                                            {
                                                value: 'focus',
                                                label: '焦点',
                                            },
                                            {
                                                value: 'contextmenu',
                                                label: '鼠标右击',
                                            },
                                        ],
                                    },
                                },
                                defaultValue: 'click',
                            },
                            {
                                name: 'placement',
                                title: '触发位置',
                                setter: {
                                    componentName: 'SelectSetter',
                                    props: {
                                        options: [
                                            {
                                                value: 'top',
                                                label: '上边居中',
                                            },
                                            {
                                                value: 'top-start',
                                                label: '上边起始位置',
                                            },
                                            {
                                                value: 'top-end',
                                                label: '上边终点位置',
                                            },
                                            {
                                                value: 'bottom',
                                                label: '下边居中',
                                            },
                                            {
                                                value: 'bottom-start',
                                                label: '下边起始位置',
                                            },
                                            {
                                                value: 'bottom-end',
                                                label: '下边终点位置',
                                            },
                                            {
                                                value: 'left',
                                                label: '左边居中',
                                            },
                                            {
                                                value: 'left-start',
                                                label: '左边起始位置',
                                            },
                                            {
                                                value: 'left-end',
                                                label: '左边终点位置',
                                            },
                                            {
                                                value: 'right',
                                                label: '右边居中',
                                            },
                                            {
                                                value: 'right-start',
                                                label: '右边起始位置',
                                            },
                                            {
                                                value: 'right-end',
                                                label: '右边终点位置',
                                            },
                                        ],
                                    },
                                    defaultValue: 'bottom',
                                },
                            },
                            {
                                name: 'offset',
                                title: '弹窗距离',
                                setter: 'NumberSetter',
                                defaultValue: 6,
                            },
                            {
                                name: 'arrow',
                                title: '显示箭头',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'disabled',
                                title: '禁用',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                        ],
                    },
                ],
                supports: {
                    style: true,
                },
                component: {
                    isContainer: true,
                    dialogControlProp: 'visible',
                },
            },
            snippets: [
                {
                    title: '下拉菜单',
                    schema: {
                        componentName: 'FDropdown',
                        props: {
                            options: [
                                {
                                    value: '1',
                                    label: '1',
                                },
                                {
                                    value: '2',
                                    label: '2',
                                },
                            ],
                        },
                        children: [
                            {
                                componentName: 'FButton',
                                props: {
                                    children: '下拉菜单',
                                },
                            },
                        ],
                    },
                },
            ],
            group: '原子组件',
            category: '导航组件',
            priority: 0,
        },
        {
            title: '步骤条',
            componentName: 'FSteps',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FSteps',
                destructuring: true,
            },
            props: [
                {
                    name: 'v-model:current',
                    propType: 'number',
                },
                {
                    name: 'status',
                    propType: 'string',
                },
                {
                    name: 'vertical',
                    propType: 'bool',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'v-model:current',
                        title: '当前步骤',
                        setter: 'VariableSetter',
                    },
                    {
                        name: 'status',
                        title: '当前步骤状态',
                        setter: {
                            componentName: 'SelectSetter',
                            props: {
                                options: [
                                    {
                                        value: 'process',
                                        label: '处理中',
                                    },
                                    {
                                        value: 'error',
                                        label: '处理错误',
                                    },
                                    {
                                        value: 'error',
                                        label: '处理完成',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'process',
                    },
                    {
                        name: 'vertical',
                        title: '是否垂直方向',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                ],
                component: {
                    isContainer: true,
                    nestingRule: {
                        childWhitelist: 'FStep',
                    },
                },
                supports: {
                    events: ['onChange'],
                    class: true,
                    style: true,
                },
            },
            snippets: [
                {
                    title: '步骤条',
                    schema: {
                        componentName: 'FSteps',
                        props: {},
                        children: [
                            {
                                componentName: 'FStep',
                                props: {
                                    title: '进行中',
                                    description: '我是描述',
                                },
                            },
                            {
                                componentName: 'FStep',
                                props: {
                                    title: '待处理',
                                    description: '我是描述',
                                },
                            },
                        ],
                    },
                },
            ],
            group: '原子组件',
            category: '导航组件',
            priority: 0,
        },
        {
            title: '步骤条选项',
            componentName: 'FStep',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FStep',
                destructuring: true,
            },
            props: [
                {
                    name: 'title',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'node'],
                    },
                },
                {
                    name: 'description',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'node'],
                    },
                },
                {
                    name: 'status',
                    propType: 'number',
                },
                {
                    name: 'icon',
                    propType: 'node',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'title',
                        title: '标题',
                        setter: ['StringSetter', 'SlotSetter'],
                        defaultValue: '我是标题',
                    },
                    {
                        name: 'description',
                        title: '描述',
                        setter: ['StringSetter', 'SlotSetter'],
                        defaultValue: '我是描述',
                    },
                    {
                        name: 'status',
                        title: '状态',
                        setter: {
                            componentName: 'SelectSetter',
                            props: {
                                options: [
                                    {
                                        value: 'wait',
                                        label: '待处理',
                                    },
                                    {
                                        value: 'process',
                                        label: '处理中',
                                    },
                                    {
                                        value: 'error',
                                        label: '处理错误',
                                    },
                                    {
                                        value: 'error',
                                        label: '处理完成',
                                    },
                                ],
                            },
                        },
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
                component: {
                    nestingRule: {
                        parentWhitelist: 'FSteps',
                    },
                },
                supports: {
                    class: true,
                    style: true,
                },
            },
            snippets: [
                {
                    title: '步骤条选项',
                    schema: {
                        componentName: 'FStep',
                        props: {
                            title: '我是标题',
                            description: '我是描述',
                        },
                    },
                },
            ],
            group: '原子组件',
            category: '导航组件',
            priority: 0,
        },
        {
            title: '分页',
            componentName: 'FPagination',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FPagination',
                destructuring: true,
            },
            props: [
                {
                    name: 'v-model:pageSize',
                    propType: 'number',
                },
                {
                    name: 'v-model:currentPage',
                    propType: 'number',
                },
                {
                    name: 'totalCount',
                    propType: 'number',
                },
                {
                    name: 'pageSizeOption',
                    propType: 'array',
                },
                {
                    name: 'showTotal',
                    propType: 'bool',
                },
                {
                    name: 'showQuickJumper',
                    propType: 'bool',
                },
                {
                    name: 'small',
                    propType: 'bool',
                },
                {
                    name: 'simple',
                    propType: 'bool',
                },
                {
                    name: 'showSizeChanger',
                    propType: 'bool',
                },
            ],
            configure: {
                props: [
                    {
                        title: '基础功能',
                        type: 'group',
                        display: 'block',
                        items: [
                            {
                                name: 'v-model:currentPage',
                                title: '当前页码',
                                setter: 'VariableSetter',
                            },
                            {
                                name: 'v-model:pageSize',
                                title: '每页个数',
                                setter: 'VariableSetter',
                            },
                            {
                                name: 'totalCount',
                                title: '总条数',
                                setter: 'NumberSetter',
                            },
                        ],
                    },
                    {
                        title: '样式',
                        type: 'group',
                        display: 'block',
                        items: [
                            {
                                name: 'showQuickJumper',
                                title: '快速跳转',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'showTotal',
                                title: '总条数',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'small',
                                title: '小型样式',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'simple',
                                title: '简洁样式',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                        ],
                    },
                    {
                        title: '每页条数选择器',
                        type: 'group',
                        display: 'block',
                        items: [
                            {
                                name: 'showSizeChanger',
                                title: '开启',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'pageSizeOption',
                                title: '选项',
                                setter: {
                                    componentName: 'ArraySetter',
                                    props: {
                                        itemSetter: {
                                            componentName: 'NumberSetter',
                                        },
                                    },
                                },
                                defaultValue: [10, 20, 30, 50, 100],
                            },
                        ],
                    },
                ],
                supports: {
                    events: ['onChange', 'onPageSizeChange'],
                    class: true,
                    style: true,
                },
            },
            snippets: [
                {
                    title: '分页',
                    schema: {
                        componentName: 'FPagination',
                        props: {
                            totalCount: 1000,
                        },
                    },
                },
            ],
            group: '原子组件',
            category: '导航组件',
            priority: 0,
        },
        {
            title: '开关',
            componentName: 'FSwitch',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FSwitch',
                destructuring: true,
            },
            props: [
                {
                    name: 'v-model',
                    title: '当前值',
                    propType: {
                        type: 'oneOfType',
                        value: ['bool', 'string', 'number'],
                    },
                },
                {
                    name: 'activeValue',
                    title: '开启对应值',
                    propType: {
                        type: 'oneOfType',
                        value: ['bool', 'string', 'number'],
                    },
                    defaultValue: true,
                },
                {
                    name: 'inactiveValue',
                    title: '关闭的值',
                    propType: {
                        type: 'oneOfType',
                        value: ['bool', 'string', 'number'],
                    },
                    defaultValue: false,
                },
                {
                    name: 'disabled',
                    title: '是否禁用',
                    propType: 'bool',
                },
                {
                    name: 'size',
                    title: '大小',
                    propType: {
                        type: 'oneOf',
                        value: ['normal', 'small'],
                    },
                    defaultValue: 'normal',
                },
                {
                    name: 'beforeChange',
                    title: '值发生改变之前的事件钩子',
                    propType: 'func',
                },
            ],
            snippets: [
                {
                    title: '开关',
                    schema: {
                        componentName: 'FSwitch',
                        props: {},
                    },
                },
            ],
            group: '原子组件',
            category: '数据录入',
            priority: 0,
        },
        {
            title: '时间选择',
            componentName: 'FTimePicker',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FTimePicker',
                destructuring: true,
            },
            props: [
                {
                    name: 'v-model',
                    title: '选中时间',
                    propType: 'string',
                },
                {
                    name: 'v-model:open',
                    title: '显示面板',
                    propType: 'bool',
                },
                {
                    name: 'appendToContainer',
                    title: '弹窗是是否挂载到容器',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'getContainer',
                    title: '配置挂载容器',
                    propType: 'func',
                },
                {
                    name: 'clearable',
                    title: '是否展示清除图标',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'disabled',
                    title: '是否禁用',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'placeholder',
                    title: '提示词',
                    propType: 'string',
                },
                {
                    name: 'format',
                    title: '时间格式',
                    propType: 'string',
                    defaultValue: 'HH:mm:ss',
                },
                {
                    name: 'hourStep',
                    title: '小时选项间隔',
                    propType: 'number',
                    defaultValue: 1,
                },
                {
                    name: 'minuteStep',
                    title: '分钟选项间隔',
                    propType: 'number',
                    defaultValue: 1,
                },
                {
                    name: 'secondStep',
                    title: '秒钟选项间隔',
                    propType: 'number',
                    defaultValue: 1,
                },
                {
                    name: 'disabledHours',
                    title: '禁止选择部分小时选项',
                    propType: 'func',
                },
                {
                    name: 'disabledMinutes',
                    title: '禁止选择部分分钟选项',
                    propType: 'func',
                },
                {
                    name: 'disabledSeconds',
                    title: '禁止选择部分秒钟选项',
                    propType: 'func',
                },
                {
                    name: 'control',
                    title: '是否显示控制区域',
                    propType: 'bool',
                    defaultValue: true,
                },
                {
                    name: 'addon',
                    title: '自定义底部',
                    propType: 'node',
                },
            ],
            configure: {
                supports: {
                    class: true,
                    style: true,
                    events: ['onChange', 'onBlur', 'onFocus'],
                },
            },
            snippets: [
                {
                    title: '时间选择',
                    schema: {
                        componentName: 'FTimePicker',
                        props: {},
                    },
                },
            ],
            group: '原子组件',
            category: '数据录入',
            priority: 0,
        },
        {
            title: '日期选择',
            componentName: 'FDatePicker',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FDatePicker',
                destructuring: true,
            },
            props: [
                {
                    name: 'v-model',
                    title: '选中时间',
                    propType: 'string',
                },
                {
                    name: 'type',
                    title: '类型',
                    propType: {
                        type: 'oneOf',
                        value: ['date', 'datetime', 'datemultiple', 'daterange', 'datetimerange', 'datemonthrange', 'year', 'month', 'quarter'],
                    },
                    defaultValue: 'date',
                },
                {
                    name: 'disabledDate',
                    title: '禁止日期',
                    propType: 'func',
                },
                {
                    name: 'disabledTime',
                    title: '禁止时间',
                    propType: 'func',
                },
                {
                    name: 'maxDate',
                    title: '最大可选日期',
                    propType: 'date',
                },
                {
                    name: 'minDate',
                    title: '最小可选日期',
                    propType: 'date',
                },
                {
                    name: 'maxRange',
                    title: '可选区间',
                    propType: 'string',
                },
                {
                    name: 'defaultTime',
                    title: '日期默认时间',
                    propType: {
                        type: 'oneOfType',
                        value: [
                            'string',
                            {
                                type: 'arrayOf',
                                value: 'string',
                            },
                        ],
                    },
                },
                {
                    name: 'popperClass',
                    title: '弹窗样式',
                    propType: 'string',
                },
                {
                    name: 'appendToContainer',
                    title: '弹窗是是否挂载到容器',
                    propType: 'bool',
                    defaultValue: true,
                },
                {
                    name: 'getContainer',
                    title: '配置挂载容器',
                    propType: 'func',
                },
                {
                    name: 'clearable',
                    title: '是否展示清除图标',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'disabled',
                    title: '是否禁用',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'placeholder',
                    title: '未选择提示',
                    propType: 'string',
                },
                {
                    name: 'format',
                    title: '时间格式',
                    propType: 'string',
                },
                {
                    name: 'hourStep',
                    title: '小时选项间隔',
                    propType: 'number',
                    defaultValue: 1,
                },
                {
                    name: 'minuteStep',
                    title: '分钟选项间隔',
                    propType: 'number',
                    defaultValue: 1,
                },
                {
                    name: 'secondStep',
                    title: '秒钟选项间隔',
                    propType: 'number',
                    defaultValue: 1,
                },
                {
                    name: 'control',
                    title: '是否显示控制区域',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'suffixIcon',
                    title: '图标',
                    propType: 'node',
                },
            ],
            configure: {
                supports: {
                    class: true,
                    style: true,
                    events: ['onChange', 'onClear', 'onBlur', 'onFocus'],
                },
            },
            snippets: [
                {
                    title: '日期选择',
                    schema: {
                        componentName: 'FDatePicker',
                        props: {},
                    },
                },
            ],
            group: '原子组件',
            category: '数据录入',
            priority: 0,
        },
        {
            title: '上传',
            componentName: 'FUpload',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FUpload',
                destructuring: true,
            },
            props: [
                {
                    name: 'accept',
                    title: '上传文件类型',
                    propType: {
                        type: 'arrayOf',
                        value: 'string',
                    },
                },
                {
                    name: 'action',
                    title: '上传接口地址',
                    propType: 'string',
                },
                {
                    name: 'beforeUpload',
                    title: '上传前钩子',
                    propType: 'func',
                },
                {
                    name: 'beforeRemove',
                    title: '删除前钩子',
                    propType: 'func',
                },
                {
                    name: 'disabled',
                    title: '是否禁用',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'fileList',
                    title: '已上传文件列表',
                    propType: {
                        type: 'arrayOf',
                        value: {
                            type: 'shape',
                            value: [
                                {
                                    name: 'name',
                                    title: '文件名',
                                    propType: 'string',
                                },
                                {
                                    name: 'url',
                                    title: '文件路径',
                                    propType: 'string',
                                },
                            ],
                        },
                    },
                },
                {
                    name: 'data',
                    title: '额外数据',
                    propType: 'object',
                },
                {
                    name: 'headers',
                    title: '请求头',
                    propType: 'object',
                },
                {
                    name: 'multiple',
                    title: '是否多选',
                    propType: 'bool',
                },
                {
                    name: 'multipleLimit',
                    title: '最大允许上传个数',
                    propType: 'number',
                },
                {
                    name: 'name',
                    title: '上传文件字段名',
                    propType: 'string',
                },
                {
                    name: 'showFileList',
                    title: '是否显示已上传文件列表',
                    propType: 'bool',
                },
                {
                    name: 'withCredentials',
                    title: '是否跨域发送cookie',
                    propType: 'bool',
                },
                {
                    name: 'timeout',
                    title: '超时时间',
                    propType: 'number',
                },
                {
                    name: 'transformResponse',
                    title: '自定义响应',
                    propType: 'func',
                },
                {
                    name: 'httpRequest',
                    title: '自定义请求',
                    propType: 'func',
                },
                {
                    name: 'tip',
                    title: '提示文字',
                    propType: 'node',
                    defaultValue: {
                        type: 'JSSlot',
                        value: [
                            {
                                componentName: 'FText',
                                props: {
                                    children: '我是提示文字',
                                },
                            },
                        ],
                    },
                },
            ],
            configure: {
                supports: {
                    class: true,
                    style: true,
                    events: ['onChange', 'onRemove', 'onSuccess', 'onError', 'onExceed', 'onProgress'],
                },
            },
            snippets: [
                {
                    title: '上传',
                    schema: {
                        componentName: 'FUpload',
                        props: {},
                    },
                },
                {
                    title: '拖拽上传',
                    schema: {
                        componentName: 'FUpload',
                        props: {},
                        children: [
                            {
                                componentName: 'FUploadDragger',
                                props: {
                                    children: '点击或者拖拽文件到此区域',
                                },
                            },
                        ],
                    },
                },
            ],
            group: '原子组件',
            category: '数据录入',
            priority: 0,
        },
        {
            title: '拖拽上传容器',
            componentName: 'FUploadDragger',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FUploadDragger',
                destructuring: true,
            },
            props: [
                {
                    name: 'children',
                    title: '内容',
                    propType: 'string',
                },
            ],
        },
        {
            title: '树形选择器',
            componentName: 'FSelectTree',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FSelectTree',
                destructuring: true,
            },
            props: [
                {
                    name: 'v-model',
                    title: '选中选项',
                    propType: {
                        type: 'oneOfType',
                        value: [
                            'string',
                            'number',
                            {
                                type: 'arrayOf',
                                value: {
                                    type: 'oneOfType',
                                    value: ['string', 'number'],
                                },
                            },
                        ],
                    },
                },
                {
                    name: 'v-model:expandedKeys',
                    title: '展开选项',
                    propType: {
                        type: 'arrayOf',
                        value: {
                            type: 'oneOfType',
                            value: ['string', 'number'],
                        },
                    },
                },
                {
                    name: 'appendToContainer',
                    title: '弹窗是是否挂载到容器',
                    propType: 'bool',
                    defaultValue: true,
                },
                {
                    name: 'getContainer',
                    title: '配置挂载容器',
                    propType: 'func',
                },
                {
                    name: 'clearable',
                    title: '是否显示清除图标',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'disabled',
                    title: '是否禁用',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'collapseTags',
                    title: '选项是否折叠展示',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'collapseTagsLimit',
                    title: '超出多少折叠',
                    propType: 'number',
                    defaultValue: 1,
                },
                {
                    name: 'tagBordered',
                    title: '选项是否有边框',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'emptyText',
                    title: '选项为空的提示文字',
                    propType: 'string',
                    defaultValue: '无数据',
                },
                {
                    name: 'multiple',
                    title: '是否多选',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'multipleLimit',
                    title: '最多选择几个',
                    propType: 'number',
                    defaultValue: 0,
                },
                {
                    name: 'placeholder',
                    title: '未选择的提示语',
                    propType: 'string',
                },
                {
                    name: 'filterable',
                    title: '是否支持过滤选项',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'filter',
                    title: '自定义过滤函数',
                    propType: 'func',
                },
                {
                    name: 'data',
                    title: '选项数据',
                    propType: {
                        type: 'arrayOf',
                        value: {
                            type: 'shape',
                            value: [
                                {
                                    name: 'value',
                                    title: '选项值',
                                    propType: {
                                        type: 'oneOfType',
                                        value: ['string', 'number'],
                                    },
                                },
                                {
                                    name: 'label',
                                    title: '选项名称',
                                    propType: 'string',
                                },
                                {
                                    name: 'selectable',
                                    title: '选项是否可选中',
                                    propType: 'bool',
                                },
                                {
                                    name: 'disabled',
                                    title: '选项是否禁用',
                                    propType: 'bool',
                                },
                                {
                                    name: 'checkable',
                                    title: '选项是否可勾选',
                                    propType: 'bool',
                                },
                                {
                                    name: 'isLeaf',
                                    title: '选项是否是叶子节点',
                                    propType: 'bool',
                                },
                                {
                                    name: 'prefix',
                                    title: '节点前缀',
                                    propType: {
                                        type: 'oneOfType',
                                        value: ['string', 'node'],
                                    },
                                },
                                {
                                    name: 'suffix',
                                    title: '节点后缀',
                                    propType: {
                                        type: 'oneOfType',
                                        value: ['string', 'node'],
                                    },
                                },
                                {
                                    name: 'children',
                                    title: '子选项数据',
                                    propType: 'array',
                                },
                            ],
                        },
                    },
                },
                {
                    name: 'accordion',
                    title: '手风琴模式',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'defaultExpandAll',
                    title: '默认展开所有选项',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'cascade',
                    title: '父子节点选中是否关联',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'checkStrictly',
                    title: '勾选策略',
                    propType: {
                        type: 'oneOf',
                        value: ['all', 'parent', 'child'],
                    },
                    defaultValue: 'child',
                },
                {
                    name: 'childrenField',
                    title: 'children字段名',
                    propType: 'string',
                    defaultValue: 'children',
                },
                {
                    name: 'valueField',
                    title: 'value字段名',
                    propType: 'string',
                    defaultValue: 'value',
                },
                {
                    name: 'labelField',
                    title: 'label字段名',
                    propType: 'string',
                    defaultValue: 'label',
                },
                {
                    name: 'remote',
                    title: '是否异步加载',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'loadData',
                    title: '异步加载数据函数',
                    propType: 'func',
                },
                {
                    name: 'inline',
                    title: '叶子节点是否一行展示',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'virtualList',
                    title: '是否虚拟滚动',
                    propType: 'bool',
                    defaultValue: false,
                },
            ],
            configure: {
                supports: {
                    class: true,
                    style: true,
                    events: ['onChange', 'onVisibleChange', 'onRemoveTag', 'onBlur', 'onFocus', 'onClear'],
                },
            },
            snippets: [
                {
                    title: '树形选择器',
                    schema: {
                        componentName: 'FSelectTree',
                        props: {
                            data: [
                                {
                                    value: '1',
                                    label: '选项一',
                                },
                            ],
                        },
                    },
                },
            ],
            group: '原子组件',
            category: '数据录入',
            priority: 0,
        },
        {
            title: '级联选择器',
            componentName: 'FSelectCascader',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FSelectCascader',
                destructuring: true,
            },
            props: [
                {
                    name: 'v-model',
                    title: '选中选项',
                    propType: {
                        type: 'oneOfType',
                        value: [
                            'string',
                            'number',
                            {
                                type: 'arrayOf',
                                value: {
                                    type: 'oneOfType',
                                    value: ['string', 'number'],
                                },
                            },
                        ],
                    },
                },
                {
                    name: 'v-model:expandedKeys',
                    title: '展开选项',
                    propType: {
                        type: 'arrayOf',
                        value: {
                            type: 'oneOfType',
                            value: ['string', 'number'],
                        },
                    },
                },
                {
                    name: 'appendToContainer',
                    title: '弹窗是是否挂载到容器',
                    propType: 'bool',
                    defaultValue: true,
                },
                {
                    name: 'getContainer',
                    title: '配置挂载容器',
                    propType: 'func',
                },
                {
                    name: 'clearable',
                    title: '是否显示清除图标',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'disabled',
                    title: '是否禁用',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'collapseTags',
                    title: '选项是否折叠展示',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'collapseTagsLimit',
                    title: '超出多少折叠',
                    propType: 'number',
                    defaultValue: 1,
                },
                {
                    name: 'tagBordered',
                    title: '选项是否有边框',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'emptyText',
                    title: '选项为空的提示文字',
                    propType: 'string',
                    defaultValue: '无数据',
                },
                {
                    name: 'multiple',
                    title: '是否多选',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'placeholder',
                    title: '未选择的提示语',
                    propType: 'string',
                },
                {
                    name: 'data',
                    title: '选项数据',
                    propType: {
                        type: 'arrayOf',
                        value: {
                            type: 'shape',
                            value: [
                                {
                                    name: 'value',
                                    title: '选项值',
                                    propType: {
                                        type: 'oneOfType',
                                        value: ['string', 'number'],
                                    },
                                },
                                {
                                    name: 'label',
                                    title: '选项名称',
                                    propType: 'string',
                                },
                                {
                                    name: 'selectable',
                                    title: '选项是否可选中',
                                    propType: 'bool',
                                },
                                {
                                    name: 'disabled',
                                    title: '选项是否禁用',
                                    propType: 'bool',
                                },
                                {
                                    name: 'checkable',
                                    title: '选项是否可勾选',
                                    propType: 'bool',
                                },
                                {
                                    name: 'isLeaf',
                                    title: '选项是否是叶子节点',
                                    propType: 'bool',
                                },
                                {
                                    name: 'prefix',
                                    title: '节点前缀',
                                    propType: {
                                        type: 'oneOfType',
                                        value: ['string', 'func'],
                                    },
                                },
                                {
                                    name: 'suffix',
                                    title: '节点后缀',
                                    propType: {
                                        type: 'oneOfType',
                                        value: ['string', 'func'],
                                    },
                                },
                                {
                                    name: 'children',
                                    title: '子选项数据',
                                    propType: 'array',
                                },
                            ],
                        },
                    },
                },
                {
                    name: 'cascade',
                    title: '父子节点选中是否关联',
                    propType: 'bool',
                    defaultValue: 'false',
                },
                {
                    name: 'checkStrictly',
                    title: '勾选策略',
                    propType: {
                        type: 'oneOf',
                        value: ['all', 'parent', 'child'],
                    },
                    defaultValue: 'child',
                },
                {
                    name: 'childrenField',
                    title: 'children字段名',
                    propType: 'string',
                    defaultValue: 'children',
                },
                {
                    name: 'valueField',
                    title: 'value字段名',
                    propType: 'string',
                    defaultValue: 'value',
                },
                {
                    name: 'labelField',
                    title: 'label字段名',
                    propType: 'string',
                    defaultValue: 'label',
                },
                {
                    name: 'remote',
                    title: '是否异步加载',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'loadData',
                    title: '异步加载数据函数',
                    propType: 'func',
                },
                {
                    name: 'expandTrigger',
                    title: '次级菜单的展开方式',
                    propType: {
                        type: 'oneOf',
                        value: ['click', 'hover'],
                    },
                    defaultValue: 'click',
                },
                {
                    name: 'emitPath',
                    title: '值是否包含路径',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'showPath',
                    title: '是否显示路径',
                    propType: 'bool',
                    defaultValue: false,
                },
            ],
            configure: {
                supports: {
                    class: true,
                    style: true,
                    events: ['onChange', 'onVisibleChange', 'onRemoveTag', 'onBlur', 'onFocus', 'onClear'],
                },
            },
            snippets: [
                {
                    title: '级联选择器',
                    schema: {
                        componentName: 'FSelectCascader',
                        props: {},
                    },
                },
            ],
            group: '原子组件',
            category: '数据录入',
            priority: 0,
        },
        {
            title: '走马灯',
            componentName: 'FCarousel',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FCarousel',
                destructuring: true,
            },
            configure: {
                component: {
                    isContainer: true,
                    nestingRule: {
                        childWhitelist: ['FCarouselItem'],
                    },
                },
                supports: {
                    events: ['onChange'],
                },
            },
            props: [
                {
                    name: 'type',
                    title: '类型',
                    propType: {
                        type: 'oneOf',
                        value: ['default', 'card'],
                    },
                    defaultValue: 'default',
                },
                {
                    name: 'height',
                    title: '高度',
                    propType: 'string',
                },
                {
                    name: 'trigger',
                    title: '指示器触发方式',
                    propType: {
                        type: 'oneOf',
                        value: ['click', 'hover'],
                    },
                    defaultValue: 'click',
                },
                {
                    name: 'autoplay',
                    title: '自动切换',
                    propType: 'bool',
                    defaultValue: true,
                },
                {
                    name: 'interval',
                    title: '自动切换间隔',
                    propType: 'number',
                    defaultValue: 3000,
                },
                {
                    name: 'loop',
                    title: '是否循环',
                    propType: 'bool',
                    defaultValue: true,
                },
                {
                    name: 'pauseOnHover',
                    title: '悬浮暂停切换',
                    propType: 'bool',
                    defaultValue: true,
                },
                {
                    name: 'indicatorType',
                    title: '指示器类型',
                    propType: {
                        type: 'oneOf',
                        value: ['linear', 'dot'],
                    },
                    defaultValue: 'linear',
                },
                {
                    name: 'indicatorPosition',
                    title: '指示器位置',
                    propType: {
                        type: 'oneOf',
                        value: ['default', 'outside', 'none'],
                    },
                    defaultValue: 'default',
                },
                {
                    name: 'indicatorPlacement',
                    title: '指示器方向',
                    propType: {
                        type: 'oneOf',
                        value: ['top', 'right', 'bottom', 'left'],
                    },
                    defaultValue: 'bottom',
                },
                {
                    name: 'showArrow',
                    title: '箭头显示时机',
                    propType: {
                        type: 'oneOf',
                        value: ['always', 'hover', 'never'],
                    },
                    defaultValue: 'hover',
                },
                {
                    name: 'initialIndex',
                    title: '初始索引',
                    propType: 'number',
                    defaultValue: 0,
                },
            ],
            snippets: [
                {
                    title: '走马灯',
                    schema: {
                        componentName: 'FCarousel',
                        props: {
                            height: '240px',
                        },
                        children: [
                            {
                                componentName: 'FCarouselItem',
                                children: [
                                    {
                                        componentName: 'FImage',
                                        props: {
                                            src: 'https://s3.bmp.ovh/imgs/2022/01/f615608955b707cd.png',
                                            style: {
                                                width: '100%',
                                                height: '100%',
                                            },
                                        },
                                    },
                                ],
                            },
                            {
                                componentName: 'FCarouselItem',
                                children: [
                                    {
                                        componentName: 'FImage',
                                        props: {
                                            src: 'https://s3.bmp.ovh/imgs/2022/01/5c8bf7eb1ef7a400.png',
                                            style: {
                                                width: '100%',
                                                height: '100%',
                                            },
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
            ],
            group: '原子组件',
            category: '信息展示',
            priority: 0,
        },
        {
            title: '走马灯选项',
            componentName: 'FCarouselItem',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FCarouselItem',
                destructuring: true,
            },
            props: [],
            configure: {
                component: {
                    isContainer: true,
                    nestingRule: {
                        parentWhitelist: ['FCarousel'],
                    },
                },
            },
            snippets: [
                {
                    title: '走马灯选项',
                    schema: {
                        componentName: 'FCarouselItem',
                        children: [],
                    },
                },
            ],
            group: '原子组件',
            category: '信息展示',
            priority: 0,
        },
        {
            title: '折叠面板',
            componentName: 'FCollapse',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FCollapse',
                destructuring: true,
            },
            props: [
                {
                    name: 'v-model',
                    title: '当前激活面板',
                    propType: {
                        type: 'oneOfType',
                        value: [
                            'string',
                            {
                                type: 'arrayOf',
                                value: 'string',
                            },
                        ],
                    },
                },
                {
                    name: 'accordion',
                    title: '手风琴模式',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'arrow',
                    title: '箭头位置',
                    propType: {
                        type: 'oneOf',
                        value: ['left', 'right'],
                    },
                    defaultValue: 'right',
                },
                {
                    name: 'embedded',
                    title: '深色背景',
                    propType: 'bool',
                    defaultValue: true,
                },
            ],
            configure: {
                component: {
                    isContainer: true,
                    nestingRule: {
                        childWhitelist: ['FCollapseItem'],
                    },
                },
                supports: {
                    events: ['onChange'],
                },
            },
            snippets: [
                {
                    title: '折叠面板',
                    schema: {
                        componentName: 'FCollapse',
                        children: [
                            {
                                componentName: 'FCollapseItem',
                                props: {
                                    name: '1',
                                    title: 'Consistency',
                                },
                                children: [
                                    {
                                        componentName: 'FText',
                                        props: {
                                            children: '岁月静好，浅笑安然。打开记忆的闸门，仿佛又回到了那年那月那时光，仿佛又见到你送给我的那盆清香茉莉，在细雨潇潇的夜晚，所呈现出来的洁净和楚楚动人。以前的过往总是在记忆深处，以固有的姿态，以从未稍离的执着提醒我，生命中有一种存在，叫以前。',
                                        },
                                    },
                                ],
                            },
                            {
                                componentName: 'FCollapseItem',
                                props: {
                                    name: '2',
                                    title: 'Feedback',
                                },
                                children: [
                                    {
                                        componentName: 'FText',
                                        props: {
                                            children: '生活是蜿蜒在山中的小径，坎坷不平，沟崖在侧。摔倒了，要哭就哭吧，怕什么，不心装模作样！这是直率，不是软弱，因为哭一场并不影响赶路，反而能增添一份留意。山花烂漫，景色宜人，如果陶醉了，想笑就笑吧，不心故作矜持！这是直率，不是骄傲，因为笑一次并不影响赶路，反而能增添一份信心。',
                                        },
                                    },
                                ],
                            },
                            {
                                componentName: 'FCollapseItem',
                                props: {
                                    name: '3',
                                    title: 'Efficiency',
                                },
                                children: [
                                    {
                                        componentName: 'FText',
                                        props: {
                                            children: '喜欢一种情意，浅浅淡淡，不远不近。念起便有一种沁心的暖，知心的柔。岁月轮转，韶华渐老，惟愿人依旧安静，温雅。世事经年，惟愿情怀依旧宁静如初。静默时光的彼岸，就让我宁心等待一场必然来临的春暖花开。即使偶尔会有心潮澎湃，亦是沉寂中的安恬与端庄。',
                                        },
                                    },
                                ],
                            },
                            {
                                componentName: 'FCollapseItem',
                                props: {
                                    name: '4',
                                    title: 'Controllability',
                                },
                                children: [
                                    {
                                        componentName: 'FText',
                                        props: {
                                            children: '一弯月光，风飘云漫，多少个明月夜，寂寞走不出思念的射线，静静的听你梦中的心跳，轻嗅你唇边的香息，柔醉你缱绻的缠绵。衣袂飘飘，心香瓣瓣，在飘渺的细雨中，衍生了无尽的眷恋。用一生的深情与你凝眸相拥，朝夕相伴。幽篁深处，落叶与娇花相随，你我的沉醉，静默了一池山水。',
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
            ],
            group: '原子组件',
            category: '信息展示',
            priority: 0,
        },
        {
            title: '折叠面板选项',
            componentName: 'FCollapseItem',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FCollapseItem',
                destructuring: true,
            },
            props: [
                {
                    name: 'name',
                    title: '标识符',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'number'],
                    },
                },
                {
                    name: 'title',
                    title: '标题',
                    propType: 'string',
                },
                {
                    name: 'disabled',
                    title: '禁用',
                    propType: 'bool',
                    defaultValue: false,
                },
            ],
            configure: {
                component: {
                    isContainer: true,
                    nestingRule: {
                        parentWhitelist: ['FCollapse'],
                    },
                },
            },
            snippets: [
                {
                    title: '折叠面板选项',
                    schema: {
                        componentName: 'FCollapseItem',
                        children: [],
                    },
                },
            ],
            group: '原子组件',
            category: '信息展示',
            priority: 0,
        },
        {
            title: '描述列表',
            componentName: 'FDescriptions',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FDescriptions',
                destructuring: true,
            },
            props: [
                {
                    name: 'column',
                    title: '总列数',
                    propType: 'number',
                    defaultValue: 3,
                },
                {
                    name: 'labelAlign',
                    title: '标签对齐方式',
                    propType: {
                        type: 'oneOf',
                        value: ['left', 'center', 'right'],
                    },
                    defaultValue: 'left',
                },
                {
                    name: 'labelPlacement',
                    title: '标签位置',
                    propType: {
                        type: 'oneOf',
                        value: ['left', 'top'],
                    },
                    defaultValue: 'left',
                },
                {
                    name: 'separator',
                    title: '分隔符',
                    propType: 'string',
                    defaultValue: ':',
                },
                {
                    name: 'title',
                    title: '标题',
                    propType: 'string',
                },
                {
                    name: 'bordered',
                    title: '边框',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'contentStyle',
                    title: '内容样式',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'object'],
                    },
                },
                {
                    name: 'labelStyle',
                    title: '标签样式',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'object'],
                    },
                },
            ],
            configure: {
                component: {
                    isContainer: true,
                    nestingRule: {
                        childWhitelist: ['FDescriptionsItem'],
                    },
                },
            },
            snippets: [
                {
                    title: '描述列表',
                    schema: {
                        componentName: 'FDescriptions',
                        props: {
                            title: '身份信息',
                        },
                        children: [
                            {
                                componentName: 'FDescriptionsItem',
                                props: {
                                    label: '姓名',
                                },
                                children: [
                                    {
                                        componentName: 'FText',
                                        props: {
                                            children: '万xx',
                                        },
                                    },
                                ],
                            },
                            {
                                componentName: 'FDescriptionsItem',
                                props: {
                                    label: '性别',
                                },
                                children: [
                                    {
                                        componentName: 'FText',
                                        props: {
                                            children: '男',
                                        },
                                    },
                                ],
                            },
                            {
                                componentName: 'FDescriptionsItem',
                                props: {
                                    label: '年龄',
                                },
                                children: [
                                    {
                                        componentName: 'FText',
                                        props: {
                                            children: '60',
                                        },
                                    },
                                ],
                            },
                            {
                                componentName: 'FDescriptionsItem',
                                props: {
                                    label: '身份证',
                                },
                                children: [
                                    {
                                        componentName: 'FText',
                                        props: {
                                            children: '42xxxxxxxxxxxxx212',
                                        },
                                    },
                                ],
                            },
                            {
                                componentName: 'FDescriptionsItem',
                                props: {
                                    label: '血型',
                                },
                                children: [
                                    {
                                        componentName: 'FText',
                                        props: {
                                            children: 'A',
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
            ],
            group: '原子组件',
            category: '信息展示',
            priority: 0,
        },
        {
            title: '描述列表选项',
            componentName: 'FDescriptionsItem',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FDescriptionsItem',
                destructuring: true,
            },
            props: [
                {
                    name: 'label',
                    title: '标签',
                    propType: 'string',
                },
                {
                    name: 'span',
                    title: '占的列数',
                    propType: 'number',
                    defaultValue: 1,
                },
                {
                    name: 'contentStyle',
                    title: '内容样式',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'object'],
                    },
                },
                {
                    name: 'labelStyle',
                    title: '标签样式',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'object'],
                    },
                },
            ],
            configure: {
                component: {
                    isContainer: true,
                    nestingRule: {
                        parentWhitelist: ['FDescriptions'],
                    },
                },
            },
            snippets: [
                {
                    title: '描述列表选项',
                    schema: {
                        componentName: 'FDescriptionsItem',
                        children: [],
                    },
                },
            ],
            group: '原子组件',
            category: '信息展示',
            priority: 0,
        },
        {
            title: '图片',
            componentName: 'FImage',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FImage',
                destructuring: true,
            },
            props: [
                {
                    name: 'src',
                    title: '图片地址',
                    propType: 'string',
                },
                {
                    name: 'width',
                    title: '宽度',
                    propType: {
                        type: 'oneOfType',
                        value: ['number', 'string'],
                    },
                },
                {
                    name: 'height',
                    title: '高度',
                    propType: {
                        type: 'oneOfType',
                        value: ['number', 'string'],
                    },
                },
                {
                    name: 'fit',
                    title: '适应容器',
                    propType: {
                        type: 'oneOf',
                        value: [
                            'fill',
                            'contain',
                            'cover',
                            'scale-down',
                            'none',
                        ],
                    },
                },
                {
                    name: 'alt',
                    title: '描述',
                    propType: 'string',
                },
                {
                    name: 'preview',
                    title: '是否预览',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'lazy',
                    title: '懒加载',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'name',
                    title: '预览名称',
                    propType: 'string',
                },
                {
                    name: 'download',
                    title: '是否下载',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'hideOnClickModal',
                    title: '点击遮罩层关闭预览',
                    propType: 'bool',
                    defaultValue: false,
                },
                {
                    name: 'scrollContainer',
                    title: '懒加载监听节点',
                    propType: 'func',
                },
                {
                    name: 'previewContainer',
                    title: '预览挂载节点',
                    propType: 'func',
                },
                {
                    name: 'placeholder',
                    title: '图片未加载占位内容',
                    propType: 'node',
                },
                {
                    name: 'error',
                    title: '加载失败显示内容',
                    propType: 'node',
                },
            ],
            configure: {
                supports: {
                    events: ['onLoad', 'onError'],
                },
            },
            snippets: [
                {
                    title: '图片',
                    schema: {
                        componentName: 'FImage',
                    },
                },
            ],
            group: '原子组件',
            category: '基础元素',
            priority: 0,
        },
        {
            title: '图片组',
            componentName: 'FPreviewGroup',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FPreviewGroup',
                destructuring: true,
            },
            props: [
                {
                    name: 'hideOnClickModal',
                    title: '点击遮罩层关闭预览',
                    propType: 'bool',
                    defaultValue: false,
                },
            ],
            configure: {
                component: {
                    isContainer: true,
                    nestingRule: {
                        childWhitelist: ['FImage'],
                    },
                },
                supports: {
                    events: ['onChange'],
                },
            },
            snippets: [
                {
                    title: '图片组',
                    schema: {
                        componentName: 'FPreviewGroup',
                        children: [],
                    },
                },
            ],
            group: '原子组件',
            category: '信息展示',
            priority: 0,
        },
        {
            title: '表格',
            componentName: 'FTable',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FTable',
                destructuring: true,
            },
            props: [
                {
                    name: 'bordered',
                    title: '边框',
                    propType: 'bool',
                },
                {
                    name: 'data',
                    title: '数据源',
                    propType: 'array',
                },
                {
                    name: 'rowClassName',
                    title: '行样式类名',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'object', 'array', 'func'],
                    },
                },
                {
                    name: 'rowStyle',
                    title: '行样式',
                    propType: {
                        type: 'oneOfType',
                        value: ['object', 'func'],
                    },
                },
                {
                    name: 'emptyText',
                    title: '空数据提示',
                    propType: 'string',
                },
                {
                    name: 'empty',
                    title: '空数据插槽',
                    propType: 'node',
                },
                {
                    name: 'height',
                    title: '高度',
                    propType: 'number',
                },
                {
                    name: 'rowKey',
                    title: '高度',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'func'],
                    },
                },
                {
                    name: 'showHeader',
                    title: '显示表头',
                    propType: 'bool',
                },
                {
                    name: 'spanMethod',
                    title: '合并列',
                    propType: 'func',
                },
                {
                    name: 'virtualScroll',
                    title: '虚拟滚动',
                    propType: 'bool',
                },
                {
                    name: 'size',
                    title: '间距大小',
                    propType: {
                        type: 'oneOf',
                        value: ['middle', 'small'],
                    },
                },
                {
                    name: 'layout',
                    title: '布局方式',
                    propType: {
                        type: 'oneOf',
                        value: ['fixed', 'auto'],
                    },
                },
                {
                    name: 'draggable',
                    title: '拖拽',
                    propType: 'bool',
                },
                {
                    name: 'beforeDragend',
                    title: '拖拽结束前钩子',
                    propType: 'func',
                },
                {
                    name: 'v-model:expandedKeys',
                    title: '展开行的key',
                    propType: {
                        type: 'arrayOf',
                        value: {
                            type: 'oneOfType',
                            value: ['string', 'number'],
                        },
                    },
                },
                {
                    name: 'v-model:checkedKeys',
                    title: '勾选行的key',
                    propType: {
                        type: 'arrayOf',
                        value: {
                            type: 'oneOfType',
                            value: ['string', 'number'],
                        },
                    },
                },
                {
                    name: 'columns',
                    title: '列配置',
                    propType: 'array',
                },
            ],
            configure: {
                props: [
                    {
                        display: 'block',
                        type: 'group',
                        title: '数据源',
                        items: [
                            {
                                name: 'data',
                                title: '数据',
                                setter: 'JsonSetter',
                            },
                            {
                                name: 'rowKey',
                                title: '行 key',
                                setter: [
                                    'StringSetter',
                                    'FunctionSetter',
                                ],
                            },
                        ],
                    },
                    {
                        name: 'columns',
                        title: '列配置',
                        display: 'block',
                        setter: [
                            'JsonSetter',
                            {
                                componentName: 'ArraySetter',
                                props: {
                                    itemSetter: {
                                        componentName: 'ObjectSetter',
                                        props: {
                                            items: [
                                                {
                                                    name: 'label',
                                                    title: '标题',
                                                    setter: 'StringSetter',
                                                },
                                                {
                                                    name: 'prop',
                                                    title: '列字段',
                                                    setter: 'StringSetter',
                                                },
                                                {
                                                    name: 'type',
                                                    title: '类型',
                                                    setter: {
                                                        componentName: 'SelectSetter',
                                                        props: {
                                                            options: [
                                                                {
                                                                    value: 'default',
                                                                    label: '数据',
                                                                },
                                                                {
                                                                    value: 'selection',
                                                                    label: '选择',
                                                                },
                                                                {
                                                                    value: 'expand',
                                                                    label: '展开',
                                                                },
                                                            ],
                                                        },
                                                    },
                                                    defaultValue: 'default',
                                                },
                                                {
                                                    name: 'minWidth',
                                                    title: '最小宽度',
                                                    setter: 'NumberSetter',
                                                },
                                                {
                                                    name: 'width',
                                                    title: '固定宽度',
                                                    setter: 'NumberSetter',
                                                },
                                                {
                                                    name: 'align',
                                                    title: '对齐方式',
                                                    setter: {
                                                        componentName: 'SelectSetter',
                                                        props: {
                                                            options: [
                                                                {
                                                                    value: 'left',
                                                                    label: '左对齐',
                                                                },
                                                                {
                                                                    value: 'center',
                                                                    label: '居中',
                                                                },
                                                                {
                                                                    value: 'right',
                                                                    label: '右对齐',
                                                                },
                                                            ],
                                                        },
                                                    },
                                                    defaultValue: 'left',
                                                },
                                                {
                                                    name: 'fixed',
                                                    title: '是否固定',
                                                    setter: {
                                                        componentName: 'SelectSetter',
                                                        props: {
                                                            options: [
                                                                {
                                                                    value: false,
                                                                    label: '不固定',
                                                                },
                                                                {
                                                                    value: 'left',
                                                                    label: '左',
                                                                },
                                                                {
                                                                    value: 'right',
                                                                    label: '右',
                                                                },
                                                            ],
                                                        },
                                                    },
                                                    defaultValue: false,
                                                },
                                                {
                                                    name: 'visible',
                                                    title: '是否显示',
                                                    setter: 'BoolSetter',
                                                    defaultValue: true,
                                                },
                                                {
                                                    name: 'ellipsis',
                                                    title: '文本溢出省略',
                                                    setter: [
                                                        'BoolSetter',
                                                        'JsonSetter',
                                                    ],
                                                    defaultValue: false,
                                                },
                                                {
                                                    name: 'selectable',
                                                    title: '可选择',
                                                    setter: 'FunctionSetter',
                                                },
                                                {
                                                    name: 'sortable',
                                                    title: '可排序',
                                                    setter: 'BoolSetter',
                                                    defaultValue: false,
                                                },
                                                {
                                                    name: 'sorter',
                                                    title: '排序函数',
                                                    setter: 'FunctionSetter',
                                                },
                                                {
                                                    name: 'formatter',
                                                    title: '格式化内容',
                                                    setter: 'FunctionSetter',
                                                },
                                                {
                                                    title: '自定义渲染',
                                                    type: 'group',
                                                    display: 'block',
                                                    items: [
                                                        {
                                                            name: 'render',
                                                            title: '自定义渲染',
                                                            setter: 'SlotSetter',
                                                            defaultValue: {
                                                                type: 'JSSlot',
                                                                params: ['slotProps'],
                                                                value: [],
                                                            },
                                                        },
                                                        {
                                                            name: 'renderHeader',
                                                            title: '自定义标题',
                                                            setter: 'SlotSetter',
                                                        },
                                                    ],
                                                },
                                                {
                                                    name: 'action',
                                                    title: '操作',
                                                    display: 'block',
                                                    setter: {
                                                        componentName: 'ArraySetter',
                                                        props: {
                                                            itemSetter: {
                                                                componentName: 'ObjectSetter',
                                                                props: {
                                                                    items: [
                                                                        {
                                                                            name: 'label',
                                                                            title: '名称',
                                                                            setter: 'StringSetter',
                                                                        },
                                                                        {
                                                                            name: 'func',
                                                                            title: '动作',
                                                                            setter: 'FunctionSetter',
                                                                        },
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                                {
                                                    title: '样式',
                                                    type: 'group',
                                                    display: 'block',
                                                    items: [
                                                        {
                                                            name: 'colClassName',
                                                            title: '列样式类名称',
                                                            setter: 'StringSetter',
                                                        },
                                                        {
                                                            name: 'colStyle',
                                                            title: '列样式',
                                                            setter: 'StyleSetter',
                                                            display: 'popup',
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                    columns: [
                                        {
                                            name: 'prop',
                                            title: '列字段',
                                            setter: 'StringSetter',
                                        },
                                        {
                                            name: 'label',
                                            title: '标题',
                                            setter: 'StringSetter',
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    {
                        title: '功能配置',
                        type: 'group',
                        display: 'block',
                        items: [
                            {
                                name: 'bordered',
                                title: '边框',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'showHeader',
                                title: '显示表头',
                                setter: 'BoolSetter',
                                defaultValue: true,
                            },
                            {
                                name: 'height',
                                title: '固定高度',
                                setter: 'NumberSetter',
                            },
                            {
                                name: 'virtualScroll',
                                title: '虚拟滚动',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'layout',
                                title: '列布局方式',
                                setter: {
                                    componentName: 'RadioGroupSetter',
                                    props: {
                                        options: [
                                            {
                                                value: 'fixed',
                                                label: '等分',
                                            },
                                            {
                                                value: 'auto',
                                                label: '自适应',
                                            },
                                        ],
                                    },
                                },
                                defaultValue: 'fixed',
                            },
                            {
                                name: 'size',
                                title: '间距大小',
                                setter: {
                                    componentName: 'RadioGroupSetter',
                                    props: {
                                        options: [
                                            {
                                                value: 'middle',
                                                label: '默认',
                                            },
                                            {
                                                value: 'small',
                                                label: '小',
                                            },
                                        ],
                                    },
                                },
                                defaultValue: 'middle',
                            },
                            {
                                name: 'spanMethod',
                                title: '合并列',
                                setter: 'FunctionSetter',
                            },

                        ],
                    },
                    {
                        title: '拖拽配置',
                        type: 'group',
                        display: 'block',
                        items: [
                            {
                                name: 'draggable',
                                title: '是否拖拽',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'beforeDragend',
                                title: '拖拽结束前钩子',
                                setter: 'FunctionSetter',
                            },
                        ],
                    },
                    {
                        title: '数据绑定',
                        type: 'group',
                        display: 'block',
                        items: [
                            {
                                name: 'v-model:expandedKeys',
                                title: '展开行的key',
                                setter: [
                                    'VariableSetter',
                                    {
                                        componentName: 'ArraySetter',
                                        props: {
                                            itemSetter: [
                                                'StringSetter',
                                                'NumberSetter',
                                            ],
                                        },
                                    },
                                ],
                            },
                            {
                                name: 'v-model:checkedKeys',
                                title: '勾选行的key',
                                setter: [
                                    'VariableSetter',
                                    {
                                        componentName: 'ArraySetter',
                                        props: {
                                            itemSetter: [
                                                'StringSetter',
                                                'NumberSetter',
                                            ],
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        title: '空数据配置',
                        type: 'group',
                        display: 'block',
                        items: [
                            {
                                name: 'emptyText',
                                title: '空数据提示',
                                setter: 'StringSetter',
                            },
                            {
                                name: 'empty',
                                title: '空数据插槽',
                                setter: 'SlotSetter',
                            },
                        ],
                    },
                    {
                        title: '行样式配置',
                        type: 'group',
                        display: 'block',
                        items: [
                            {
                                name: 'rowClassName',
                                title: '行样式类名',
                                setter: [
                                    'StringSetter',
                                ],
                            },
                            {
                                name: 'rowStyle',
                                title: '行样式',
                                setter: 'StyleSetter',
                                display: 'popup',
                            },
                        ],
                    },
                ],
                supports: {
                    events: ['onCellClick', 'onExpandChange', 'onHeaderClick', 'onRowClick', 'onSelect', 'onSelectAll', 'onSelectionChange', 'onDragstart', 'onDragend', 'onSortChange'],
                },
            },
            snippets: [
                {
                    title: '表格',
                    schema: {
                        componentName: 'FTable',
                        props: {
                            columns: [
                                {
                                    prop: 'date',
                                    label: '日期',
                                },
                                {
                                    prop: 'name',
                                    label: '姓名',
                                },
                                {
                                    prop: 'address',
                                    label: '地址',
                                },
                            ],
                            data: [
                                {
                                    date: '2016-05-01',
                                    name: '王小虎',
                                    address: '上海市普陀区金沙江路 1516 弄',
                                },
                                {
                                    date: '2016-05-02',
                                    name: '王小虎',
                                    address: '上海市普陀区金沙江路 1516 弄',
                                },
                                {
                                    date: '2016-05-03',
                                    name: '王小虎',
                                    address: '上海市普陀区金沙江路 1516 弄',
                                },
                            ],
                        },
                    },
                },
            ],
            group: '原子组件',
            category: '信息展示',
            priority: 0,
        },
        {
            title: 'Tab页',
            componentName: 'FTabs',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FTabs',
                destructuring: true,
            },
            props: [
                {
                    name: 'v-model',
                    title: '激活面板',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'number'],
                    },
                },
                {
                    name: 'panes',
                    title: '页签配置',
                    propType: {
                        type: 'arrayOf',
                        value: {
                            type: 'shape',
                            value: [
                                {
                                    name: 'name',
                                    title: '名称',
                                    propType: 'string',
                                },
                                {
                                    name: 'value',
                                    title: '值',
                                    propType: 'string',
                                },
                                {
                                    name: 'disabled',
                                    title: '禁用',
                                    propType: 'bool',
                                },
                                {
                                    name: 'closable',
                                    title: '关闭按钮',
                                    propType: 'bool',
                                },
                                {
                                    name: 'displayDirective',
                                    title: '关闭按钮',
                                    propType: {
                                        type: 'oneOf',
                                        value: ['if', 'show', 'show:lazy'],
                                    },
                                },
                                {
                                    name: 'render',
                                    title: '渲染内容',
                                    propType: 'node',
                                },
                                {
                                    name: 'renderTab',
                                    title: '渲染页签',
                                    propType: 'node',
                                },
                            ],
                        },
                    },
                },
                {
                    name: 'position',
                    title: '页签位置',
                    propType: {
                        type: 'oneOf',
                        value: ['left', 'top', 'right', 'bottom'],
                    },
                },
                {
                    name: 'type',
                    title: '页签类型',
                    propType: {
                        type: 'oneOf',
                        value: ['line', 'card'],
                    },
                },
                {
                    name: 'closable',
                    title: '可关闭',
                    propType: 'bool',
                },
                {
                    name: 'closeMode',
                    title: '关闭按钮显示类型',
                    propType: {
                        type: 'oneOf',
                        value: ['visible', 'hover'],
                    },
                },
                {
                    name: 'transition',
                    title: '动画',
                    propType: 'bool',
                },
                {
                    name: 'prefix',
                    title: '前置内容',
                    propType: 'node',
                },
                {
                    name: 'suffix',
                    title: '后置内容',
                    propType: 'node',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'v-model',
                        title: '激活页签',
                        setter: 'VariableSetter',
                    },
                    {
                        name: 'panes',
                        title: '页签配置',
                        display: 'block',
                        setter: {
                            componentName: 'ArraySetter',
                            props: {
                                itemSetter: {
                                    componentName: 'ObjectSetter',
                                    props: {
                                        items: [
                                            {
                                                name: 'name',
                                                title: '标题',
                                                setter: 'StringSetter',
                                            },
                                            {
                                                name: 'value',
                                                title: '页签key',
                                                setter: 'StringSetter',
                                            },
                                            {
                                                name: 'render',
                                                title: '渲染内容',
                                                setter: 'SlotSetter',
                                                defaultValue: {
                                                    type: 'JSSlot',
                                                    value: [],
                                                },
                                            },
                                            {
                                                name: 'disabled',
                                                title: '禁用',
                                                setter: 'BoolSetter',
                                                defaultValue: false,
                                            },
                                            {
                                                name: 'closable',
                                                title: '可关闭',
                                                setter: 'BoolSetter',
                                                defaultValue: false,
                                            },
                                            {
                                                name: 'displayDirective',
                                                title: '子项加载策略',
                                                setter: {
                                                    componentName: 'SelectSetter',
                                                    props: {
                                                        options: [
                                                            {
                                                                value: 'if',
                                                                label: '切换重新加载',
                                                            },
                                                            {
                                                                value: 'show',
                                                                label: '默认加载',
                                                            },
                                                            {
                                                                value: 'show:lazy',
                                                                label: '显示时才加载',
                                                            },
                                                        ],
                                                    },
                                                },
                                                defaultValue: 'if',
                                            },

                                            {
                                                name: 'renderTab',
                                                title: '自定义标题',
                                                setter: 'SlotSetter',
                                            },
                                        ],
                                    },
                                },
                                columns: [
                                    {
                                        name: 'name',
                                        title: '标题',
                                        setter: 'StringSetter',
                                    },
                                    {
                                        name: 'value',
                                        title: '页签key',
                                        setter: 'StringSetter',
                                    },
                                ],
                                defaultItemValue: (field: IPublicModelSettingField): any => {
                                    const value = field.getValue();
                                    return {
                                        name: '默认标题',
                                        value: `${value.length + 1}`,
                                        render: {
                                            type: 'JSSlot',
                                            title: '渲染内容',
                                            value: [],
                                        },
                                    };
                                },
                            },
                        },
                    },
                    {
                        title: '其他配置',
                        type: 'group',
                        display: 'block',
                        items: [
                            {
                                name: 'position',
                                title: '页签位置',
                                setter: {
                                    componentName: 'SelectSetter',
                                    props: {
                                        options: [
                                            {
                                                value: 'left',
                                                label: '左',
                                            },
                                            {
                                                value: 'right',
                                                label: '右',
                                            },
                                            {
                                                value: 'top',
                                                label: '上',
                                            },
                                            {
                                                value: 'bottom',
                                                label: '下',
                                            },
                                        ],
                                    },
                                },
                                defaultValue: 'top',
                            },
                            {
                                name: 'type',
                                title: '页签类型',
                                setter: {
                                    componentName: 'SelectSetter',
                                    props: {
                                        options: [
                                            {
                                                value: 'line',
                                                label: '线型',
                                            },
                                            {
                                                value: 'card',
                                                label: '卡片样式',
                                            },
                                        ],
                                    },
                                },
                                defaultValue: 'line',
                            },
                            {
                                name: 'closable',
                                title: '可关闭',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'closeMode',
                                title: '关闭按钮触发时机',
                                setter: {
                                    componentName: 'SelectSetter',
                                    props: {
                                        options: [
                                            {
                                                value: 'visible',
                                                label: '一直显示',
                                            },
                                            {
                                                value: 'hover',
                                                label: '悬浮显示',
                                            },
                                        ],
                                    },
                                },
                                defaultValue: 'visible',
                            },
                            {
                                name: 'transition',
                                title: '切换动画',
                                setter: 'BoolSetter',
                                defaultValue: true,
                            },

                        ],
                    },
                    {
                        title: '插槽',
                        type: 'group',
                        display: 'block',
                        items: [
                            {
                                name: 'prefix',
                                title: '前置内容',
                                setter: 'SlotSetter',
                            },
                            {
                                name: 'suffix',
                                title: '后置内容',
                                setter: 'SlotSetter',
                            },
                        ],
                    },
                ],
                component: {},
                supports: {
                    events: ['onClose', 'onChange'],
                },
            },
            snippets: [
                {
                    title: 'Tab页',
                    schema: {
                        componentName: 'FTabs',
                        props: {
                            panes: [
                                {
                                    name: '标题',
                                    value: '1',
                                    render: {
                                        type: 'JSSlot',
                                        value: [],
                                    },
                                },
                            ],
                        },
                    },
                },
            ],
            group: '原子组件',
            category: '导航组件',
            priority: 0,
        },
        {
            title: '标签',
            componentName: 'FTag',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FTag',
                destructuring: true,
            },
            props: [
                {
                    name: 'type',
                    title: '类型',
                    propType: {
                        type: 'oneOf',
                        value: ['default', 'success', 'info', 'warning', 'danger'],
                    },
                },
                {
                    name: 'closable',
                    title: '可关闭',
                    propType: 'bool',
                },
                {
                    name: 'backgroundColor',
                    title: '背景色',
                    propType: 'string',
                },
                {
                    name: 'closable',
                    title: '可关闭',
                    propType: 'bool',
                },
                {
                    name: 'size',
                    title: '大小',
                    propType: {
                        type: 'oneOf',
                        value: ['small', 'middle', 'large'],
                    },
                },
                {
                    name: 'effect',
                    title: '主题',
                    propType: {
                        type: 'oneOf',
                        value: ['dark', 'light', 'plain'],
                    },
                },
                {
                    name: 'bordered',
                    title: '边框',
                    propType: 'bool',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'type',
                        title: '类型',
                        setter: {
                            componentName: 'SelectSetter',
                            props: {
                                options: [
                                    {
                                        value: 'default',
                                        label: '默认',
                                    },
                                    {
                                        value: 'info',
                                        label: '信息',
                                    },
                                    {
                                        value: 'success',
                                        label: '成功',
                                    },
                                    {
                                        value: 'warning',
                                        label: '警告',
                                    },
                                    {
                                        value: 'danger',
                                        label: '错误',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'default',
                    },
                    {
                        name: 'children',
                        title: '内容',
                        setter: 'StringSetter',
                    },
                    {
                        name: 'bordered',
                        title: '边框',
                        setter: 'BoolSetter',
                        defaultValue: true,
                    },
                    {
                        name: 'closable',
                        title: '可关闭',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'backgroundColor',
                        title: '背景色',
                        setter: 'ColorSetter',
                    },
                    {
                        name: 'size',
                        title: '大小',
                        setter: {
                            componentName: 'RadioGroupSetter',
                            props: {
                                options: [
                                    {
                                        value: 'small',
                                        label: '小',
                                    },
                                    {
                                        value: 'middle',
                                        label: '中',
                                    },
                                    {
                                        value: 'large',
                                        label: '大',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'middle',
                    },
                    {
                        name: 'effect',
                        title: '主题',
                        setter: {
                            componentName: 'RadioGroupSetter',
                            props: {
                                options: [
                                    {
                                        value: 'dark',
                                        label: '深色',
                                    },
                                    {
                                        value: 'light',
                                        label: '亮色',
                                    },
                                    {
                                        value: 'plain',
                                        label: '无色',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'light',
                    },
                    {
                        name: 'icon',
                        title: '按钮',
                        setter: {
                            componentName: 'IconSetter',
                            props: {
                                type: 'node',
                            },
                        },
                    },
                ],
                supports: {
                    style: true,
                    class: true,
                },
            },
            snippets: [
                {
                    title: '标签',
                    schema: {
                        componentName: 'FTag',
                        props: {
                            children: '我是标签',
                        },
                    },
                },
            ],
            group: '原子组件',
            category: '信息展示',
            priority: 0,
        },
        {
            title: '警告提示',
            componentName: 'FAlert',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FAlert',
                destructuring: true,
            },
            props: [
                {
                    name: 'type',
                    title: '类型',
                    propType: {
                        type: 'oneOf',
                        value: ['success', 'info', 'warning', 'error'],
                    },
                },
                {
                    name: 'message',
                    title: '消息标题',
                    propType: 'string',
                },
                {
                    name: 'description',
                    title: '消息内容',
                    propType: 'string',
                },
                {
                    name: 'showIcon',
                    title: '显示图标',
                    propType: 'bool',
                },
                {
                    name: 'closable',
                    title: '可关闭',
                    propType: 'bool',
                },
                {
                    name: 'center',
                    title: '居中',
                    propType: 'bool',
                },
                {
                    name: 'beforeClose',
                    title: '关闭前钩子',
                    propType: 'func',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'type',
                        title: '类型',
                        setter: {
                            componentName: 'SelectSetter',
                            props: {
                                options: [
                                    {
                                        value: 'info',
                                        label: '信息',
                                    },
                                    {
                                        value: 'success',
                                        label: '成功',
                                    },
                                    {
                                        value: 'warning',
                                        label: '警告',
                                    },
                                    {
                                        value: 'error',
                                        label: '错误',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'info',
                    },
                    {
                        name: 'message',
                        title: '提示内容',
                        setter: 'StringSetter',
                    },
                    {
                        name: 'description',
                        title: '辅助信息',
                        setter: 'StringSetter',
                    },
                    {
                        name: 'showIcon',
                        title: '显示图标',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'closable',
                        title: '可关闭',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'center',
                        title: '是否居中',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'beforeClose',
                        title: '关闭前钩子',
                        setter: 'FunctionSetter',
                    },
                    {
                        title: '插槽',
                        type: 'group',
                        display: 'block',
                        items: [
                            {
                                name: 'default',
                                title: '自定义消息',
                                setter: 'SlotSetter',
                            },
                            {
                                name: 'descriptionSlot',
                                title: '自定义辅助消息',
                                setter: 'SlotSetter',
                                defaultValue: {
                                    type: 'JSSlot',
                                    name: 'description',
                                    value: [],
                                },
                            },
                            {
                                name: 'icon',
                                title: '自定义图标',
                                setter: {
                                    componentName: 'IconSetter',
                                    props: {
                                        type: 'node',
                                    },
                                },
                            },
                            {
                                name: 'action',
                                title: '自定义操作',
                                setter: 'SlotSetter',
                            },
                        ],
                    },
                ],
                supports: {
                    style: true,
                    class: true,
                },
            },
            snippets: [
                {
                    title: '警告提示',
                    schema: {
                        componentName: 'FAlert',
                        props: {
                            type: 'info',
                            message: '常规信息提示内容',
                        },
                    },
                },
            ],
            group: '原子组件',
            category: '信息反馈',
            priority: 0,
        },
        {
            title: '文字提示',
            componentName: 'FTooltip',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FTooltip',
                destructuring: true,
            },
            props: [
                {
                    name: 'modelValue',
                    title: '显示提示',
                    propType: 'bool',
                },
                {
                    name: 'model',
                    title: '弹出模式',
                    propType: {
                        type: 'oneOf',
                        value: ['text', 'confirm', 'popover'],
                    },
                },
                {
                    name: 'popperClass',
                    title: '弹出框class',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'object', 'array'],
                    },
                },
                {
                    name: 'title',
                    title: '标题',
                    propType: 'string',
                },
                {
                    name: 'content',
                    title: '内容',
                    propType: 'string',
                },
                {
                    name: 'placement',
                    title: '位置',
                    propType: {
                        type: 'oneOf',
                        value: [
                            'auto',
                            'top',
                            'top-start',
                            'top-end',
                            'bottom',
                            'bottom-start',
                            'bottom-end',
                            'right',
                            'right-start',
                            'right-end',
                            'left',
                            'left-start',
                            'left-end',
                        ],
                    },
                },
                {
                    name: 'trigger',
                    title: '触发方式',
                    propType: {
                        type: 'oneOf',
                        value: ['hover', 'click', 'focus'],
                    },
                },
                {
                    name: 'disabled',
                    title: '禁用',
                    propType: 'bool',
                },
                {
                    name: 'offset',
                    title: '偏移量',
                    propType: 'number',
                },
                {
                    name: 'showAfter',
                    title: '显示延迟',
                    propType: 'number',
                },
                {
                    name: 'hideAfter',
                    title: '消失延迟',
                    propType: 'number',
                },
                {
                    name: 'arrow',
                    title: '箭头',
                    propType: 'bool',
                },
                {
                    name: 'confirmOption',
                    title: '确认模式选项',
                    propType: {
                        type: 'exact',
                        value: [
                            {
                                name: 'okText',
                                title: '确认按钮文字',
                                propType: 'string',
                            },
                            {
                                name: 'cancelText',
                                title: '取消按钮文字',
                                propType: 'string',
                            },
                            {
                                name: 'icon',
                                title: '图标',
                                propType: 'node',
                            },
                        ],
                    },
                },
                {
                    name: 'getContainer',
                    title: '渲染容器节点',
                    propType: 'func',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'modelValue',
                        title: '是否显示',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'model',
                        title: '模式',
                        setter: {
                            componentName: 'SelectSetter',
                            props: {
                                options: [
                                    {
                                        value: 'text',
                                        label: 'text',
                                    },
                                    {
                                        value: 'confirm',
                                        label: 'confirm',
                                    },
                                    {
                                        value: 'popover',
                                        label: 'popover',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'text',
                    },
                    {
                        title: '内容配置',
                        type: 'group',
                        display: 'block',
                        items: [
                            {
                                name: 'title',
                                title: '标题',
                                setter: ['StringSetter', 'SlotSetter'],
                            },
                            {
                                name: 'content',
                                title: '内容',
                                setter: ['StringSetter', 'SlotSetter'],
                            },
                        ],
                    },
                    {
                        name: 'confirmOption',
                        title: '确认提示选项',
                        type: 'group',
                        display: 'block',
                        items: [
                            {
                                name: 'okText',
                                title: '确认按钮文字',
                                setter: 'StringSetter',
                                defaultValue: '确定',
                            },
                            {
                                name: 'cancelText',
                                title: '取消按钮文字',
                                setter: 'StringSetter',
                                defaultValue: '取消',
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
                    {
                        title: '弹出配置',
                        type: 'group',
                        display: 'block',
                        items: [
                            {
                                name: 'disabled',
                                title: '禁用',
                                setter: 'BoolSetter',
                            },
                            {
                                name: 'trigger',
                                title: '触发方式',
                                setter: {
                                    componentName: 'SelectSetter',
                                    props: {
                                        options: [
                                            {
                                                value: 'hover',
                                                label: 'hover',
                                            },
                                            {
                                                value: 'click',
                                                label: 'click',
                                            },
                                            {
                                                value: 'focus',
                                                label: 'focus',
                                            },
                                        ],
                                    },
                                },
                            },
                            {
                                name: 'placement',
                                title: '弹出位置',
                                setter: {
                                    componentName: 'SelectSetter',
                                    props: {
                                        options: [
                                            {
                                                value: 'auto',
                                                label: 'auto',
                                            },
                                            {
                                                value: 'top',
                                                label: 'top',
                                            },
                                            {
                                                value: 'top-start',
                                                label: 'top-start',
                                            },
                                            {
                                                value: 'top-end',
                                                label: 'top-end',
                                            },
                                            {
                                                value: 'bottom',
                                                label: 'bottom',
                                            },
                                            {
                                                value: 'bottom-start',
                                                label: 'bottom-start',
                                            },
                                            {
                                                value: 'bottom-end',
                                                label: 'bottom-end',
                                            },
                                            {
                                                value: 'left',
                                                label: 'left',
                                            },
                                            {
                                                value: 'left-start',
                                                label: 'left-start',
                                            },
                                            {
                                                value: 'left-end',
                                                label: 'left-end',
                                            },
                                            {
                                                value: 'right',
                                                label: 'right',
                                            },
                                            {
                                                value: 'right-start',
                                                label: 'right-start',
                                            },
                                            {
                                                value: 'right-end',
                                                label: 'right-end',
                                            },

                                        ],
                                    },
                                },
                                defaultValue: 'auto',
                            },
                            {
                                name: 'arrow',
                                title: '箭头',
                                setter: 'BoolSetter',
                                defaultValue: true,
                            },
                            {
                                name: 'offset',
                                title: '偏移量',
                                setter: 'NumberSetter',
                                defaultValue: 8,
                            },
                            {
                                name: 'showAfter',
                                title: '显示延迟（毫秒）',
                                setter: 'NumberSetter',
                                defaultValue: 0,
                            },
                            {
                                name: 'hideAfter',
                                title: '消失延迟（毫秒）',
                                setter: 'NumberSetter',
                                defaultValue: 200,
                            },
                            {
                                name: 'popperClass',
                                title: '弹出框样式类名',
                                setter: 'StringSetter',
                            },
                            {
                                name: 'appendToContainer',
                                title: '弹窗是是否挂载到容器',
                                setter: 'BoolSetter',
                                defaultValue: true,
                            },
                            {
                                name: 'getContainer',
                                title: '配置挂载容器',
                                setter: 'FunctionSetter',
                                defaultValue: () => {
                                    return function () {
                                        return document.body;
                                    };
                                },
                            },
                        ],
                    },

                ],
                component: {
                    isContainer: true,
                    dialogControlProp: 'modelValue',
                },
                supports: {
                    events: ['onOk', 'onCancel'],
                },
            },
            snippets: [
                {
                    title: '文字提示',
                    schema: {
                        componentName: 'FTooltip',
                        props: {
                            content: '在一件事情的关键部分做出精妙的补充，使整个事情更加完美',
                        },
                        children: [
                            {
                                componentName: 'FText',
                                props: {
                                    children: '画龙点睛',
                                },
                            },
                        ],
                    },
                },
                {
                    title: '确认提示',
                    schema: {
                        componentName: 'FTooltip',
                        props: {
                            mode: 'confirm',
                            title: '是否删除当前工单？',
                            content: '删除后无法恢复哦',
                        },
                        children: [
                            {
                                componentName: 'FButton',
                                props: {
                                    children: '删除',
                                },
                            },
                        ],
                    },
                },
                {
                    title: '内容提示',
                    schema: {
                        componentName: 'FTooltip',
                        props: {
                            mode: 'popover',
                            title: '我是标题',
                            content: '我是内容',
                        },
                        children: [
                            {
                                componentName: 'FButton',
                                props: {
                                    children: '查看更多',
                                },
                            },
                        ],
                    },
                },
            ],
            group: '原子组件',
            category: '信息反馈',
            priority: 0,
        },
        {
            title: '加载中',
            componentName: 'FSpin',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FSpin',
                destructuring: true,
            },
            props: [
                {
                    name: 'show',
                    title: '显示',
                    propType: 'bool',
                },
                {
                    name: 'size',
                    title: '大小',
                    propType: {
                        type: 'oneOf',
                        value: ['middle', 'small', 'large'],
                    },
                },
                {
                    name: 'description',
                    title: '描述',
                    propType: 'string',
                },
                {
                    name: 'stroke',
                    title: '边框颜色',
                    propType: 'string',
                },
                {
                    name: 'delay',
                    title: '延迟显示',
                    propType: 'number',
                },
                {
                    name: 'icon',
                    title: '图标',
                    propType: 'node',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'show',
                        title: '显示',
                        setter: 'BoolSetter',
                        defaultValue: true,
                    },
                    {
                        name: 'size',
                        title: '大小',
                        setter: {
                            componentName: 'SelectSetter',
                            props: {
                                options: [
                                    {
                                        value: 'small',
                                        label: '小',
                                    },
                                    {
                                        value: 'middle',
                                        label: '中',
                                    },
                                    {
                                        value: 'large',
                                        label: '大',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'middle',
                    },
                    {
                        name: 'description',
                        title: '描述',
                        setter: ['StringSetter', 'SlotSetter'],
                    },
                    {
                        name: 'stroke',
                        title: '边框颜色',
                        setter: 'ColorSetter',
                    },
                    {
                        name: 'delay',
                        title: '延迟显示',
                        setter: 'NumberSetter',
                    },
                    {
                        name: 'icon',
                        title: '自定义图标',
                        setter: {
                            componentName: 'IconSetter',
                            props: {
                                type: 'node',
                            },
                        },
                    },
                    {
                        name: 'default',
                        title: '包裹内容',
                        setter: 'SlotSetter',
                    },
                ],
            },
            snippets: [
                {
                    title: '加载中',
                    schema: {
                        componentName: 'FSpin',
                    },
                },
            ],
            group: '原子组件',
            category: '信息反馈',
            priority: 0,
        },
        {
            title: '抽屉',
            componentName: 'FDrawer',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FDrawer',
                destructuring: true,
            },
            props: [
                {
                    name: 'v-model:show',
                    title: '显示',
                    propType: 'bool',
                },
                {
                    name: 'displayDirective',
                    title: '渲染指令',
                    propType: {
                        type: 'oneOf',
                        value: ['show', 'if'],
                    },
                },
                {
                    name: 'closable',
                    title: '可关闭',
                    propType: 'bool',
                },
                {
                    name: 'closable',
                    title: '可关闭',
                    propType: 'bool',
                },
                {
                    name: 'mask',
                    title: '蒙层',
                    propType: 'bool',
                },
                {
                    name: 'maskClosable',
                    title: '点击蒙层关闭',
                    propType: 'bool',
                },
                {
                    name: 'title',
                    title: '标题',
                    propType: 'string',
                },
                {
                    name: 'placement',
                    title: '方向',
                    propType: {
                        type: 'oneOf',
                        value: ['top', 'bottom', 'left', 'right'],
                    },
                },
                {
                    name: 'height',
                    title: '高度',
                    propType: 'number',
                },
                {
                    name: 'width',
                    title: '宽度',
                    propType: 'number',
                },
                {
                    name: 'footer',
                    title: '底部',
                    propType: 'bool',
                },
                {
                    name: 'okText',
                    title: '确认按钮文字',
                    propType: 'string',
                },
                {
                    name: 'cancelText',
                    title: '取消按钮文字',
                    propType: 'string',
                },
                {
                    name: 'contentClass',
                    title: '内容样式名称',
                    propType: 'string',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'show',
                        title: '显示',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'placement',
                        title: '方向',
                        setter: {
                            componentName: 'SelectSetter',
                            props: {
                                options: [
                                    {
                                        label: '上',
                                        value: 'top',
                                    },
                                    {
                                        label: '下',
                                        value: 'bottom',
                                    },
                                    {
                                        label: '左',
                                        value: 'left',
                                    },
                                    {
                                        label: '右',
                                        value: 'right',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'right',
                    },
                    {
                        name: 'height',
                        title: '高度',
                        setter: 'NumberSetter',
                    },
                    {
                        name: 'width',
                        title: '宽度',
                        setter: 'NumberSetter',
                    },
                    {
                        name: 'displayDirective',
                        title: '渲染方式',
                        setter: {
                            componentName: 'RadioGroupSetter',
                            props: {
                                options: [
                                    {
                                        label: '渲染一次',
                                        value: 'show',
                                    },
                                    {
                                        label: '多次渲染',
                                        value: 'if',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'show',
                    },
                    {
                        name: 'closable',
                        title: '可关闭',
                        setter: 'BoolSetter',
                        defaultValue: true,
                    },
                    {
                        name: 'mask',
                        title: '是否有蒙层',
                        setter: 'BoolSetter',
                        defaultValue: true,
                    },
                    {
                        name: 'maskClosable',
                        title: '点击蒙层关闭',
                        setter: 'BoolSetter',
                        defaultValue: true,
                    },
                    {
                        name: 'title',
                        title: '标题',
                        setter: 'StringSetter',
                    },
                    {
                        name: 'titleSlot',
                        title: '自定义标题',
                        setter: 'SlotSetter',
                        defaultValue: {
                            type: 'JSSlot',
                            name: 'title',
                            value: [],
                        },
                    },
                    {
                        name: 'footer',
                        title: '是否有底部',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'okText',
                        title: '确认按钮文字',
                        setter: 'StringSetter',
                        defaultValue: '确定',
                    },
                    {
                        name: 'cancelText',
                        title: '取消按钮文字',
                        setter: 'StringSetter',
                        defaultValue: '取消',
                    },
                    {
                        name: 'footerSlot',
                        title: '自定义底部',
                        setter: 'SlotSetter',
                        defaultValue: {
                            type: 'JSSlot',
                            name: 'footer',
                            value: [],
                        },
                    },
                    {
                        name: 'contentClass',
                        title: '内容样式名称',
                        setter: 'StringSetter',
                    },
                ],
                component: {
                    isContainer: true,
                    dialogControlProp: 'show',
                    isModal: true,
                },
                supports: {
                    // TODO: StyleSetter会出错
                    events: ['onUpdate:show', 'onOk', 'onCancel'],
                },
            },
            snippets: [
                {
                    title: '抽屉',
                    schema: {
                        componentName: 'FDrawer',
                        props: {
                            show: true,
                        },
                    },
                },
            ],
            group: '原子组件',
            category: '对话框类',
            priority: 0,
        },
        {
            title: '模态框',
            componentName: 'FModal',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FModal',
                destructuring: true,
            },
            props: [
                {
                    name: 'show',
                    title: '显示',
                    propType: 'bool',
                },
                {
                    name: 'displayDirective',
                    title: '渲染指令',
                    propType: {
                        type: 'oneOf',
                        value: ['show', 'if'],
                    },
                },
                {
                    name: 'closable',
                    title: '可关闭',
                    propType: 'bool',
                },
                {
                    name: 'mask',
                    title: '蒙层',
                    propType: 'bool',
                },
                {
                    name: 'maskClosable',
                    title: '点击蒙层关闭',
                    propType: 'bool',
                },
                {
                    name: 'title',
                    title: '标题',
                    propType: 'string',
                },
                {
                    name: 'width',
                    title: '宽度',
                    propType: 'number',
                },
                {
                    name: 'top',
                    title: '距离顶部',
                    propType: 'number',
                },
                {
                    name: 'verticalCenter',
                    title: '垂直居中',
                    propType: 'bool',
                },
                {
                    name: 'center',
                    title: '内容居中',
                    propType: 'bool',
                },
                {
                    name: 'fullScreen',
                    title: '全屏',
                    propType: 'bool',
                },
                {
                    name: 'footer',
                    title: '底部',
                    propType: 'bool',
                },
                {
                    name: 'okText',
                    title: '确认按钮文字',
                    propType: 'string',
                },
                {
                    name: 'cancelText',
                    title: '取消按钮文字',
                    propType: 'string',
                },
                {
                    name: 'getContainer',
                    title: '挂载节点',
                    propType: 'func',
                },
                {
                    name: 'contentClass',
                    title: '内容样式名称',
                    propType: 'string',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'show',
                        title: '显示',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'title',
                        title: '标题',
                        setter: ['StringSetter', 'SlotSetter'],
                    },
                    {
                        name: 'displayDirective',
                        title: '渲染方式',
                        setter: {
                            componentName: 'RadioGroupSetter',
                            props: {
                                options: [
                                    {
                                        label: '渲染一次',
                                        value: 'show',
                                    },
                                    {
                                        label: '多次渲染',
                                        value: 'if',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'show',
                    },
                    {
                        name: 'closable',
                        title: '可关闭',
                        setter: 'BoolSetter',
                        defaultValue: true,
                    },
                    {
                        name: 'mask',
                        title: '蒙层',
                        setter: 'BoolSetter',
                        defaultValue: true,
                    },
                    {
                        name: 'maskClosable',
                        title: '点击蒙层关闭',
                        setter: 'BoolSetter',
                        defaultValue: true,
                    },
                    {
                        name: 'width',
                        title: '宽度',
                        setter: 'NumberSetter',
                        defaultValue: 520,
                    },
                    {
                        name: 'top',
                        title: '距离顶部',
                        setter: 'NumberSetter',
                        defaultValue: 50,
                    },
                    {
                        name: 'verticalCenter',
                        title: '垂直居中',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'center',
                        title: '内容居中',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'fullScreen',
                        title: '全屏',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'footer',
                        title: '底部',
                        setter: 'BoolSetter',
                        defaultValue: true,
                    },
                    {
                        name: 'footer',
                        title: '自定底部',
                        setter: 'SlotSetter',
                        defaultValue: {
                            type: 'JSSlot',
                            name: 'footer',
                            value: [],
                        },
                    },
                    {
                        name: 'okText',
                        title: '确认按钮文字',
                        setter: 'StringSetter',
                        defaultValue: '确认',
                    },
                    {
                        name: 'cancelText',
                        title: '取消按钮文字',
                        setter: 'StringSetter',
                        defaultValue: '取消',
                    },
                    {
                        name: 'contentClass',
                        title: '内容样式名称',
                        setter: 'StringSetter',
                    },
                    {
                        name: 'appendToContainer',
                        title: '弹窗是是否挂载到容器',
                        setter: 'BoolSetter',
                        defaultValue: true,
                    },
                    {
                        name: 'getContainer',
                        title: '配置挂载容器',
                        setter: 'FunctionSetter',
                        defaultValue: () => {
                            return function () {
                                return document.body;
                            };
                        },
                    },
                ],
                component: {
                    isContainer: true,
                    dialogControlProp: 'show',
                    isModal: true,
                },
                supports: {
                    // TODO: StyleSetter会出错
                    events: ['onUpdate:show', 'onOk', 'onCancel'],
                },
            },
            snippets: [
                {
                    title: '模态框',
                    schema: {
                        componentName: 'FModal',
                        props: {
                            show: true,
                        },
                    },
                },
            ],
            group: '原子组件',
            category: '对话框类',
            priority: 0,
        },
        {
            title: '栅格',
            componentName: 'FGrid',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FGrid',
                destructuring: true,
            },
            group: '原子组件',
            category: '布局组件',
            priority: 0,
            props: [
                {
                    name: 'align',
                    propType: 'string',
                },
                {
                    name: 'gutter',
                    propType: {
                        type: 'oneOfType',
                        value: [
                            'number',
                            {
                                type: 'arrayOf',
                                value: 'number',
                            },
                        ],
                    },
                },
                {
                    name: 'justify',
                    propType: 'string',
                },
                {
                    name: 'wrap',
                    propType: 'bool',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'align',
                        title: '垂直对齐',
                        setter: {
                            componentName: 'SelectSetter',
                            props: {
                                options: [
                                    {
                                        value: 'flex-start',
                                        label: '上对齐',
                                    },
                                    {
                                        value: 'center',
                                        label: '居中',
                                    },
                                    {
                                        value: 'flex-end',
                                        label: '下对齐',
                                    },
                                    {
                                        value: 'baseline',
                                        label: '基线对齐',
                                    },
                                    {
                                        value: 'stretch',
                                        label: '上下拉齐',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'flex-start',
                    },
                    {
                        name: 'gutter',
                        title: '间隔',
                        setter: [
                            'NumberSetter',
                            {
                                componentName: 'ArraySetter',
                                props: {
                                    itemSetter: {
                                        componentName: 'NumberSetter',
                                    },
                                },
                            },
                        ],
                        defaultValue: 0,
                    },
                    {
                        name: 'justify',
                        title: '水平排列',
                        setter: {
                            componentName: 'SelectSetter',
                            props: {
                                options: [
                                    {
                                        value: 'flex-start',
                                        label: '左',
                                    },
                                    {
                                        value: 'center',
                                        label: '居中',
                                    },
                                    {
                                        value: 'flex-end',
                                        label: '右',
                                    },
                                    {
                                        value: 'space-around',
                                        label: '空间环绕',
                                    },
                                    {
                                        value: 'space-between',
                                        label: '两端',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'flex-start',
                    },
                    {
                        name: 'wrap',
                        title: '自动换行',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                ],
                component: {
                    isContainer: true,
                    nestingRule: {
                        childWhitelist: ['FGridItem'],
                    },
                },
                supports: {
                    class: true,
                    style: true,
                },
            },
            snippets: [
                {
                    title: '栅格',
                    schema: {
                        componentName: 'FGrid',
                    },
                },
            ],
        },
        {
            title: '栅格子项',
            componentName: 'FGridItem',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FGridItem',
                destructuring: true,
            },
            group: '原子组件',
            category: '布局组件',
            priority: 0,
            props: [
                {
                    name: 'flex',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'number'],
                    },
                },
                {
                    name: 'offset',
                    propType: 'number',
                },
                {
                    name: 'span',
                    propType: 'number',
                },
                {
                    name: 'pull',
                    propType: 'number',
                },
                {
                    name: 'push',
                    propType: 'number',
                },
                {
                    name: 'order',
                    propType: 'number',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'span',
                        title: '占位格数',
                        setter: 'NumberSetter',
                    },
                    {
                        name: 'offset',
                        title: '左侧间隔',
                        setter: 'NumberSetter',
                        defaultValue: 0,
                    },
                    {
                        name: 'pull',
                        title: '向左移动',
                        setter: 'NumberSetter',
                        defaultValue: 0,
                    },
                    {
                        name: 'push',
                        title: '向右移动',
                        setter: 'NumberSetter',
                        defaultValue: 0,
                    },
                    {
                        name: 'order',
                        title: '顺序',
                        setter: 'NumberSetter',
                    },
                    {
                        name: 'flex',
                        title: '自定义flex',
                        setter: ['StringSetter', 'NumberSetter'],
                    },
                ],
                component: {
                    isContainer: true,
                    nestingRule: {
                        parentWhitelist: ['FGrid'],
                    },
                },
                supports: {
                    class: true,
                    style: true,
                },
            },
            snippets: [
                {
                    title: '栅格子项',
                    schema: {
                        componentName: 'FGridItem',
                    },
                },
            ],
        },
        {
            title: '菜单',
            componentName: 'FMenu',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FMenu',
                destructuring: true,
            },
            group: '原子组件',
            category: '导航组件',
            priority: 0,
            props: [
                {
                    name: 'v-model',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'number'],
                    },
                },
                {
                    name: 'mode',
                    propType: {
                        type: 'oneOf',
                        value: ['horizontal', 'vertical'],
                    },
                },
                {
                    name: 'collapsed',
                    propType: 'bool',
                },
                {
                    name: 'inverted',
                    propType: 'bool',
                },
                {
                    name: 'defaultExpandAll',
                    propType: 'bool',
                },
                {
                    name: 'expandedKeys',
                    propType: {
                        type: 'arrayOf',
                        value: {
                            type: 'oneOfType',
                            value: ['string', 'number'],
                        },
                    },
                },
                {
                    name: 'accordion',
                    propType: 'bool',
                },
                {
                    name: 'options',
                    propType: 'array',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'v-model',
                        title: '选中菜单',
                        setter: 'VariableSetter',
                    },
                    {
                        name: 'v-model:expandedKeys',
                        title: '展开菜单',
                        setter: 'VariableSetter',
                    },
                    {
                        name: 'options',
                        title: '选项配置',
                        setter: [
                            'JsonSetter',
                        ],
                    },
                    {
                        name: 'mode',
                        title: '模式',
                        setter: {
                            componentName: 'RadioGroupSetter',
                            props: {
                                options: [
                                    {
                                        value: 'horizontal',
                                        label: '水平',
                                    },
                                    {
                                        value: 'vertical',
                                        label: '垂直',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'horizontal',
                    },
                    {
                        name: 'collapsed',
                        title: '是否折叠',
                        setter: 'BoolSetter',
                        defaultValue: false,
                        condition: (target) => {
                            const val = target.top.getPropValue('mode');
                            return val === 'horizontal';
                        },
                    },
                    {
                        name: 'inverted',
                        title: '反转样式',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'defaultExpandAll',
                        title: '展开全部菜单',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'accordion',
                        title: '手风琴模式',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                ],
                supports: {
                    class: true,
                    style: true,
                    events: ['onSelect'],
                },
            },
            snippets: [
                {
                    title: '菜单',
                    schema: {
                        componentName: 'FMenu',
                        props: {
                            options: [
                                {
                                    label: '华中地区',
                                    value: '1.0',
                                    children: [
                                        {
                                            value: '1.1',
                                            label: '湖南',
                                        },
                                        {
                                            value: '1.2',
                                            label: '湖北',
                                        },
                                    ],
                                },
                                {
                                    label: '华南地区',
                                    value: '2.0',
                                    children: [
                                        {
                                            value: '2.1',
                                            label: '广东',
                                        },
                                        {
                                            value: '2.2',
                                            label: '广西',
                                        },
                                    ],
                                },
                                {
                                    value: '3',
                                    label: '北京',
                                },
                            ],
                        },
                    },
                },
            ],
        },
        {
            title: '滚动条',
            componentName: 'FScrollbar',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FScrollbar',
                destructuring: true,
            },
            group: '原子组件',
            category: '通用组件',
            priority: 0,
            props: [
                {
                    name: 'height',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'number'],
                    },
                },
                {
                    name: 'maxHeight',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'number'],
                    },
                },
                {
                    name: 'native',
                    propType: 'bool',
                },
                {
                    name: 'noresize',
                    propType: 'bool',
                },
                {
                    name: 'always',
                    propType: 'bool',
                },
                {
                    name: 'minSize',
                    propType: 'number',
                },
                {
                    name: 'shadow',
                    propType: {
                        type: 'oneOfType',
                        value: [
                            'bool',
                            {
                                type: 'shape',
                                value: [
                                    {
                                        name: 'x',
                                        propType: 'bool',
                                    },
                                    {
                                        name: 'y',
                                        propType: 'bool',
                                    },
                                ],
                            },
                        ],
                    },
                },
                {
                    name: 'containerClass',
                    propType: {
                        type: 'oneOfType',
                        value: ['array', 'object', 'string'],
                    },
                },
                {
                    name: 'containerStyle',
                    propType: {
                        type: 'oneOfType',
                        value: ['array', 'object', 'string'],
                    },
                },
                {
                    name: 'contentStyle',
                    propType: {
                        type: 'oneOfType',
                        value: ['array', 'object', 'string'],
                    },
                },
                {
                    name: 'horizontalRatioStyle',
                    propType: {
                        type: 'oneOfType',
                        value: ['array', 'object', 'string'],
                    },
                },
                {
                    name: 'verticalRatioStyle',
                    propType: {
                        type: 'oneOfType',
                        value: ['array', 'object', 'string'],
                    },
                },
            ],
            configure: {
                props: [
                    {
                        name: 'height',
                        title: '固定高度',
                        setter: ['NumberSetter', 'StringSetter'],
                    },
                    {
                        name: 'maxHeight',
                        title: '最大高度',
                        setter: ['NumberSetter', 'StringSetter'],
                    },
                    {
                        name: 'native',
                        title: '原生滚动样式',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'noresize',
                        title: '不响应容器尺寸变化',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'always',
                        title: '总是显示滚动条',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'minSize',
                        title: '滑块最小尺寸',
                        setter: 'NumberSetter',
                        defaultValue: 20,
                    },
                    {
                        name: 'shadow',
                        title: '待滚动区域阴影',
                        setter: [
                            'BoolSetter',
                            {
                                componentName: 'ObjectSetter',
                                props: {
                                    items: [
                                        {
                                            name: 'x',
                                            title: '水平轴',
                                            setter: 'BoolSetter',
                                        },
                                        {
                                            name: 'y',
                                            title: '垂直轴',
                                            setter: 'BoolSetter',
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    {
                        name: 'containerClass',
                        title: '包裹容器类名',
                        setter: 'StringSetter',
                    },
                    {
                        name: 'containerStyle',
                        title: '包裹容器样式',
                        setter: 'StyleSetter',
                        display: 'popup',
                    },
                    {
                        name: 'contentStyle',
                        title: '内容样式',
                        setter: 'StyleSetter',
                        display: 'popup',
                    },
                    {
                        name: 'horizontalRatioStyle',
                        title: '水平滚动条样式',
                        setter: 'StyleSetter',
                        display: 'popup',
                    },
                    {
                        name: 'verticalRatioStyle',
                        title: '垂直滚动条样式',
                        setter: 'StyleSetter',
                        display: 'popup',
                    },
                ],
                component: {
                    isContainer: true,
                },
                supports: {
                    class: true,
                    style: true,
                    events: ['onScroll'],
                },
            },
            snippets: [
                {
                    title: '滚动条',
                    schema: {
                        componentName: 'FScrollbar',
                        props: {
                        },
                    },
                },
            ],
        },
        {
            title: '树形控件',
            componentName: 'FTree',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FTree',
                destructuring: true,
            },
            group: '原子组件',
            category: '信息展示',
            priority: 0,
            props: [
                {
                    name: 'data',
                    propType: {
                        type: 'arrayOf',
                        value: {
                            type: 'shape',
                            value: [
                                {
                                    name: 'value',
                                    title: '选项值',
                                    propType: {
                                        type: 'oneOfType',
                                        value: ['string', 'number'],
                                    },
                                },
                                {
                                    name: 'label',
                                    title: '选项名称',
                                    propType: 'string',
                                },
                                {
                                    name: 'selectable',
                                    title: '选项是否可选中',
                                    propType: 'bool',
                                },
                                {
                                    name: 'disabled',
                                    title: '选项是否禁用',
                                    propType: 'bool',
                                },
                                {
                                    name: 'checkable',
                                    title: '选项是否可勾选',
                                    propType: 'bool',
                                },
                                {
                                    name: 'isLeaf',
                                    title: '选项是否是叶子节点',
                                    propType: 'bool',
                                },
                                {
                                    name: 'prefix',
                                    title: '节点前缀',
                                    propType: {
                                        type: 'oneOfType',
                                        value: ['string', 'node'],
                                    },
                                },
                                {
                                    name: 'suffix',
                                    title: '节点后缀',
                                    propType: {
                                        type: 'oneOfType',
                                        value: ['string', 'node'],
                                    },
                                },
                                {
                                    name: 'children',
                                    title: '子选项数据',
                                    propType: 'array',
                                },
                            ],
                        },
                    },
                },
                {
                    name: 'defaultExpandAll',
                    propType: 'bool',
                },
                {
                    name: 'v-model:expandedKeys',
                    propType: {
                        type: 'arrayOf',
                        value: {
                            type: 'oneOfType',
                            value: ['string', 'number'],
                        },
                    },
                },
                {
                    name: 'selectable',
                    propType: 'bool',
                },
                {
                    name: 'v-model:selectedKeys',
                    propType: {
                        type: 'arrayOf',
                        value: {
                            type: 'oneOfType',
                            value: ['string', 'number'],
                        },
                    },
                },
                {
                    name: 'multiple',
                    propType: 'bool',
                },
                {
                    name: 'cancelable',
                    propType: 'bool',
                },
                {
                    name: 'checkable',
                    propType: 'bool',
                },
                {
                    name: 'cascade',
                    propType: 'bool',
                },
                {
                    name: 'checkStrictly',
                    propType: {
                        type: 'oneOf',
                        value: ['all', 'parent', 'child'],
                    },
                },
                {
                    name: 'v-model:checkedKeys',
                    propType: {
                        type: 'arrayOf',
                        value: {
                            type: 'oneOfType',
                            value: ['string', 'number'],
                        },
                    },
                },
                {
                    name: 'childrenField',
                    propType: 'string',
                },
                {
                    name: 'valueField',
                    propType: 'string',
                },
                {
                    name: 'labelField',
                    propType: 'string',
                },
                {
                    name: 'remote',
                    propType: 'bool',
                },
                {
                    name: 'loadData',
                    propType: 'func',
                },
                {
                    name: 'accordion',
                    propType: 'bool',
                },
                {
                    name: 'draggable',
                    propType: 'bool',
                },
                {
                    name: 'inline',
                    propType: 'bool',
                },
                {
                    name: 'virtualList',
                    propType: 'bool',
                },
                {
                    name: 'filterMethod',
                    propType: 'func',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'data',
                        title: '节点数据',
                        display: 'block',
                        setter: [
                            'JsonSetter',
                            {
                                componentName: 'ArraySetter',
                                props: {
                                    itemSetter: {
                                        componentName: 'ObjectSetter',
                                        props: {
                                            items: [
                                                {
                                                    name: 'label',
                                                    title: '节点名称',
                                                    setter: 'StringSetter',
                                                },
                                                {
                                                    name: 'value',
                                                    title: '节点值',
                                                    setter: ['StringSetter', 'NumberSetter'],
                                                },
                                                {
                                                    name: 'selectable',
                                                    title: '可选中',
                                                    setter: 'BoolSetter',
                                                },
                                                {
                                                    name: 'disabled',
                                                    title: '是否禁用',
                                                    setter: 'BoolSetter',
                                                },
                                                {
                                                    name: 'checkable',
                                                    title: '可勾选',
                                                    setter: 'BoolSetter',
                                                },
                                                {
                                                    name: 'isLeaf',
                                                    title: '是否叶子节点',
                                                    setter: 'BoolSetter',
                                                    defaultValue: false,
                                                },
                                                {
                                                    name: 'prefix',
                                                    title: '前缀',
                                                    setter: ['StringSetter', 'SlotSetter'],
                                                },
                                                {
                                                    name: 'suffix',
                                                    title: '后缀',
                                                    setter: ['StringSetter', 'SlotSetter'],
                                                },
                                                {
                                                    name: 'children',
                                                    title: '子节点数据',
                                                    display: 'block',
                                                    setter: {
                                                        componentName: 'ArraySetter',
                                                        props: {
                                                            infinite: true,
                                                        },
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                    columns: [
                                        {
                                            name: 'label',
                                            title: '节点名称',
                                            setter: 'StringSetter',
                                        },
                                        {
                                            name: 'value',
                                            title: '节点值',
                                            setter: ['StringSetter', 'NumberSetter'],
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    {
                        title: '节点数据字段配置',
                        type: 'group',
                        display: 'block',
                        items: [
                            {
                                name: 'childrenField',
                                title: 'children字段名',
                                setter: 'StringSetter',
                                defaultValue: 'children',
                            },
                            {
                                name: 'valueField',
                                title: 'value字段名',
                                setter: 'StringSetter',
                                defaultValue: 'value',
                            },
                            {
                                name: 'labelField',
                                title: 'label字段名',
                                setter: 'StringSetter',
                                defaultValue: 'label',
                            },
                        ],
                    },
                    {
                        title: '展开配置',
                        type: 'group',
                        display: 'block',
                        items: [
                            {
                                name: 'v-model:expandedKeys',
                                title: '展开的节点',
                                setter: 'VariableSetter',
                            },
                            {
                                name: 'accordion',
                                title: '手风琴模式',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'defaultExpandAll',
                                title: '默认展开所有选项',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                        ],
                    },
                    {
                        title: '选中配置',
                        type: 'group',
                        display: 'block',
                        items: [
                            {
                                name: 'selectable',
                                title: '可选中',
                                setter: 'BoolSetter',
                                defaultValue: true,
                            },
                            {
                                name: 'cancelable',
                                title: '可取消',
                                setter: 'BoolSetter',
                                defaultValue: true,
                            },
                            {
                                name: 'multiple',
                                title: '可多选',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'v-model:selectedKeys',
                                title: '选中的节点',
                                setter: 'VariableSetter',
                            },
                        ],
                    },
                    {
                        title: '勾选配置',
                        type: 'group',
                        display: 'block',
                        items: [
                            {
                                name: 'checkable',
                                title: '可勾选',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'cascade',
                                title: '父子节点是否关联',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'checkStrictly',
                                title: '勾选策略',
                                setter: {
                                    componentName: 'SelectSetter',
                                    props: {
                                        options: [
                                            {
                                                value: 'all',
                                                label: '所有关联节点',
                                            },
                                            {
                                                value: 'parent',
                                                label: '关联父节点',
                                            },
                                            {
                                                value: 'child',
                                                label: '关联子节点',
                                            },
                                        ],
                                    },
                                },
                                defaultValue: 'child',
                            },
                            {
                                name: 'v-model:checkedKeys',
                                title: '勾选的节点',
                                setter: 'VariableSetter',
                            },
                        ],
                    },
                    {
                        title: '异步加载配置',
                        type: 'group',
                        display: 'block',
                        items: [
                            {
                                name: 'remote',
                                title: '是否异步加载',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'loadData',
                                title: '异步加载数据函数',
                                setter: 'FunctionSetter',
                            },
                        ],
                    },
                    {
                        title: '其他配置',
                        type: 'group',
                        display: 'block',
                        items: [
                            {
                                name: 'draggable',
                                title: '可拖拽',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'inline',
                                title: '是否一行展示叶子节点',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'virtualList',
                                title: '是否虚拟滚动',
                                setter: 'BoolSetter',
                                defaultValue: false,
                            },
                            {
                                name: 'filterMethod',
                                title: '自定义过滤函数',
                                setter: 'FunctionSetter',
                            },
                        ],
                    },

                ],
                supports: {
                    class: true,
                    style: true,
                    events: [
                        'onCheck',
                        'onExpand',
                        'onSelect',
                        'onDragstart',
                        'onDragend',
                        'onDragenter',
                        'onDragleave',
                        'onDragover',
                        'onDrop',
                    ],
                },
            },
            snippets: [
                {
                    title: '树形控件',
                    schema: {
                        componentName: 'FTree',
                        props: {
                            data: [
                                {
                                    value: '1',
                                    label: '1',
                                },
                                {
                                    value: '2',
                                    label: '2',
                                },
                            ],
                        },
                    },
                },
            ],
        },
        {
            title: '虚拟列表',
            componentName: 'FVirtualList',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FVirtualList',
                destructuring: true,
            },
            group: '原子组件',
            category: '通用组件',
            priority: 0,
            props: [
                {
                    name: 'dataSources',
                    propType: 'array',
                },
                {
                    name: 'dataKey',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'func'],
                    },
                },
                {
                    name: 'keeps',
                    propType: 'number',
                },
                {
                    name: 'estimateSize',
                    propType: 'number',
                },
                {
                    name: 'start',
                    propType: 'number',
                },
                {
                    name: 'offset',
                    propType: 'number',
                },
                {
                    name: 'direction',
                    propType: {
                        type: 'oneOf',
                        value: ['vertical', 'horizontal'],
                    },
                },
                {
                    name: 'wrapTag',
                    propType: 'string',
                },
                {
                    name: 'wrapClass',
                    propType: 'string',
                },
                {
                    name: 'wrapStyle',
                    propType: 'object',
                },
                {
                    name: 'height',
                    propType: 'number',
                },
                {
                    name: 'maxHeight',
                    propType: 'number',
                },
                {
                    name: 'topThreshold',
                    propType: 'number',
                },
                {
                    name: 'bottomThreshold',
                    propType: 'number',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'dataSources',
                        title: '数据源',
                        setter: 'JsonSetter',
                    },
                    {
                        name: 'dataKey',
                        title: 'key',
                        setter: ['StringSetter', 'FunctionSetter'],
                    },
                    {
                        name: 'direction',
                        title: '方向',
                        setter: {
                            componentName: 'RadioGroupSetter',
                            props: {
                                options: [
                                    {
                                        label: '垂直',
                                        value: 'vertical',
                                    },
                                    {
                                        label: '水平',
                                        value: 'horizontal',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'vertical',
                    },
                    {
                        name: 'keeps',
                        title: '真实渲染量',
                        setter: 'NumberSetter',
                        defaultValue: 30,
                    },
                    {
                        name: 'estimateSize',
                        title: '每项平均高度或者宽度',
                        setter: 'NumberSetter',
                        defaultValue: 50,
                    },
                    {
                        name: 'height',
                        title: '固定高度',
                        setter: 'NumberSetter',
                    },
                    {
                        name: 'maxHeight',
                        title: '最大高度',
                        setter: 'NumberSetter',
                    },
                    {
                        name: 'topThreshold',
                        title: '触发totop阈值',
                        setter: 'NumberSetter',
                        defaultValue: 0,
                    },
                    {
                        name: 'bottomThreshold',
                        title: '触发tobottom阈值',
                        setter: 'NumberSetter',
                        defaultValue: 0,
                    },
                    {
                        name: 'start',
                        title: '开始索引',
                        setter: 'NumberSetter',
                        defaultValue: 0,
                    },
                    {
                        name: 'offset',
                        title: '偏移',
                        setter: 'NumberSetter',
                        defaultValue: 0,
                    },
                    {
                        name: 'wrapTag',
                        title: '包裹元素',
                        setter: 'StringSetter',
                        defaultValue: 'div',
                    },
                    {
                        name: 'wrapClass',
                        title: '包裹元素样式类名',
                        setter: 'StringSetter',
                    },
                    {
                        name: 'wrapStyle',
                        title: '包裹元素样式',
                        setter: 'StyleSetter',
                        display: 'popup',
                    },
                    {
                        name: 'default',
                        title: '子项插槽',
                        setter: 'SlotSetter',
                    },
                ],
                supports: {
                    style: true,
                    class: true,
                    events: ['onScroll', 'onTotop', 'onTobottom', 'onResized'],
                },
            },
            snippets: [
                {
                    title: '虚拟列表',
                    schema: {
                        componentName: 'FVirtualList',
                        props: {
                            dataSources: [],
                            dataKey: 'id',
                        },
                    },
                },
            ],
        },
        {
            title: '骨架屏',
            componentName: 'FSkeleton',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FSkeleton',
                destructuring: true,
            },
            props: [
                {
                    name: 'text',
                    propType: 'bool',
                },
                {
                    name: 'round',
                    propType: 'bool',
                },
                {
                    name: 'circle',
                    propType: 'bool',
                },
                {
                    name: 'height',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'number'],
                    },
                },
                {
                    name: 'width',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'number'],
                    },
                },
                {
                    name: 'size',
                    propType: {
                        type: 'oneOf',
                        value: ['small', 'middle', 'large'],
                    },
                },
                {
                    name: 'repeat',
                    propType: 'number',
                },
                {
                    name: 'animated',
                    propType: 'bool',
                },
                {
                    name: 'sharp',
                    propType: 'bool',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'sharp',
                        title: '直角',
                        setter: 'BoolSetter',
                        defaultValue: true,
                    },
                    {
                        name: 'text',
                        title: '文本',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'round',
                        title: '圆角',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'circle',
                        title: '圆形',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'height',
                        title: '高度',
                        setter: ['NumberSetter', 'StringSetter'],
                    },
                    {
                        name: 'width',
                        title: '宽度',
                        setter: ['NumberSetter', 'StringSetter'],
                    },
                    {
                        name: 'size',
                        title: '大小',
                        setter: {
                            componentName: 'SelectSetter',
                            props: {
                                options: [
                                    {
                                        value: 'small',
                                        label: '小',
                                    },
                                    {
                                        value: 'middle',
                                        label: '中',
                                    },
                                    {
                                        value: 'large',
                                        label: '大',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'middle',
                    },
                    {
                        name: 'repeat',
                        title: '重复次数',
                        setter: 'NumberSetter',
                        defaultValue: 1,
                    },
                    {
                        name: 'animated',
                        title: '启用动画',
                        setter: 'BoolSetter',
                        defaultValue: true,
                    },

                ],
            },
            snippets: [
                {
                    title: '骨架屏',
                    schema: {
                        componentName: 'FSkeleton',
                        props: {
                            text: true,
                        },
                    },
                },
            ],
            group: '原子组件',
            category: '信息反馈',
            priority: 0,
        },
        {
            title: '全局配置',
            componentName: 'FConfigProvider',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.8.38',
                exportName: 'FConfigProvider',
                destructuring: true,
            },
            props: [
                {
                    name: 'getContainer',
                    propType: 'func',
                },
                {
                    name: 'locale',
                    propType: 'object',
                },
                {
                    name: 'themeOverrides',
                    propType: 'object',
                },
            ],
            configure: {
                props: [
                    {
                        name: 'getContainer',
                        title: '挂载容器',
                        setter: 'FunctionSetter',
                        defaultValue: () => {
                            return function () {
                                return document.body;
                            };
                        },
                    },
                    {
                        name: 'locale',
                        title: '语言',
                        setter: 'JsonSetter',
                    },
                    {
                        name: 'themeOverrides',
                        title: '主题覆盖',
                        setter: 'JsonSetter',
                    },
                ],
                component: {
                    isContainer: true,
                },
            },
            snippets: [
                {
                    title: '全局配置',
                    schema: {
                        componentName: 'FConfigProvider',
                        props: {},
                    },
                },
            ],
            group: '原子组件',
            category: '通用组件',
            priority: 0,
        },
    ],
    utils: [{
        name: 'FMessage',
        type: 'npm',
        content: {
            package: '@fesjs/fes-design',
            version: '0.8.38',
            exportName: 'FMessage',
            destructuring: true,
        },
    }, {
        name: 'FModal',
        type: 'npm',
        content: {
            package: '@fesjs/fes-design',
            version: '0.8.38',
            exportName: 'FModal',
            destructuring: true,
        },
    }, {
        name: 'showToast',
        type: 'npm',
        content: {
            package: 'vant',
            version: '4.9.0',
            exportName: 'showToast',
            destructuring: true,
        },
    }],
    sort: {
        groupList: ['原子组件', '低代码组件', '精选组件'],
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
