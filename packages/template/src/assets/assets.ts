import { AssetsJson } from '@webank/letgo-types';

const assets: AssetsJson = {
    packages: [
        {
            package: '@fesjs/fes-design',
            version: '0.7.17',
            urls: [
                'https://unpkg.com/@fesjs/fes-design@0.7.17/dist/fes-design.js',
                'https://unpkg.com/@fesjs/fes-design@0.7.17/dist/fes-design.css',
            ],
            library: 'FesDesign',
        },
        {
            package: 'naive-ui',
            version: '2.32.0',
            urls: ['https://unpkg.com/naive-ui@2.32.0/dist/index.prod.js'],
            library: 'naive',
        },
    ],
    components: [
        {
            title: '页面',
            componentName: 'Page',
            props: [
                {
                    name: 'style',
                    propType: 'object',
                    defaultValue: {
                        padding: 12,
                    },
                },
            ],
            configure: {
                supports: {
                    style: true,
                },
                component: {
                    isContainer: true,
                    disableBehaviors: '*',
                },
            },
        },
        {
            title: '插槽',
            componentName: 'Slot',
            configure: {
                component: {
                    isContainer: true,
                    disableBehaviors: '*',
                },
            },
        },
        {
            title: '头像',
            componentName: 'NAvatar',
            npm: {
                package: 'naive-ui',
                version: '2.32.0',
                exportName: 'NAvatar',
                destructuring: true,
            },
            props: [
                {
                    name: 'src',
                    propType: 'string',
                },
                {
                    name: 'circle',
                    propType: 'bool',
                },
                {
                    name: 'round',
                    propType: 'bool',
                },
                {
                    name: 'bordered',
                    propType: 'bool',
                },
                {
                    name: 'size',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'number'],
                    },
                },
            ],
            configure: {
                props: [
                    {
                        name: 'src',
                        title: '图片链接地址',
                        setter: 'StringSetter',
                    },
                    {
                        name: 'circle',
                        title: '是否为圆形',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'round',
                        title: '是否显示圆角',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'bordered',
                        title: '是否带边框',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'size',
                        title: '头像大小',
                        setter: {
                            componentName: 'MixedSetter',
                            props: {
                                setters: [
                                    {
                                        componentName: 'RadioGroupSetter',
                                        props: {
                                            options: [
                                                {
                                                    label: 'small',
                                                    value: 'small',
                                                },
                                                {
                                                    label: 'medium',
                                                    value: 'medium',
                                                },
                                                {
                                                    label: 'large',
                                                    value: 'large',
                                                },
                                            ],
                                            defaultValue: 'medium',
                                        },
                                    },
                                    'NumberSetter',
                                ],
                            },
                        },
                    },
                ],
                supports: {
                    style: true,
                    events: ['onClick', 'onError'],
                },
            },
            snippets: [
                {
                    title: '头像',
                    screenshot:
                        'https://helios-allpublic-1257616148.cos.ap-shanghai.myqcloud.com/img/avatar.png',
                    schema: {
                        componentName: 'NAvatar',
                        props: {
                            circle: true,
                            round: false,
                            src: 'https://v2.vuejs.org/images/logo.svg',
                            size: 'medium',
                        },
                    },
                },
            ],
            group: '精选组件',
            category: '基础元素',
            priority: 0,
        },
        {
            title: '卡片',
            componentName: 'NCard',
            npm: {
                package: 'naive-ui',
                version: '2.32.0',
                exportName: 'NCard',
                destructuring: true,
            },
            props: [
                {
                    name: 'title',
                    propType: 'string',
                },
                {
                    name: 'size',
                    propType: {
                        type: 'oneOf',
                        value: ['small', 'medium', 'large', 'huge'],
                    },
                },
                {
                    name: 'bordered',
                    propType: 'bool',
                },
                {
                    name: 'closable',
                    propType: 'bool',
                },
                {
                    name: 'hoverable',
                    propType: 'bool',
                },
                {
                    name: 'segmented',
                    propType: 'object',
                },
                {
                    name: 'header',
                    propType: 'node',
                },
                {
                    name: 'action',
                    propType: 'node',
                },
                {
                    name: 'footer',
                    propType: 'node',
                },
                {
                    name: 'header-extra',
                    propType: 'node',
                },
            ],
            configure: {
                supports: {
                    style: true,
                    events: ['onClose'],
                    loop: false,
                },
                component: {
                    isContainer: true,
                },
                props: [
                    {
                        type: 'group',
                        title: '卡片样式',
                        extraProps: {
                            display: 'block',
                        },
                        items: [
                            {
                                name: 'size',
                                title: '卡片尺寸',
                                setter: {
                                    componentName: 'RadioGroupSetter',
                                    props: {
                                        options: [
                                            {
                                                label: 'small',
                                                value: 'small',
                                            },
                                            {
                                                label: 'medium',
                                                value: 'medium',
                                            },
                                            {
                                                label: 'large',
                                                value: 'large',
                                            },
                                            {
                                                label: 'huge',
                                                value: 'huge',
                                            },
                                        ],
                                    },
                                    defaultValue: 'medium',
                                },
                            },
                            {
                                name: 'bordered',
                                title: '显示边框',
                                setter: 'BoolSetter',
                            },
                            {
                                name: 'closable',
                                title: '显示关闭图标',
                                setter: 'BoolSetter',
                            },
                            {
                                name: 'hoverable',
                                title: '可悬浮',
                                setter: 'BoolSetter',
                            },
                        ],
                    },
                    {
                        type: 'group',
                        title: '分割线',
                        extraProps: {
                            display: 'block',
                        },
                        items: [
                            {
                                name: 'segmented.content',
                                title: '内容分割线',
                                setter: {
                                    componentName: 'BoolSetter',
                                    defaultValue: false,
                                },
                            },
                            {
                                name: 'segmented.footer',
                                title: '底部分割线',
                                setter: {
                                    componentName: 'BoolSetter',
                                    defaultValue: false,
                                },
                            },
                            {
                                name: 'segmented.action',
                                title: '操作区分割线',
                                setter: {
                                    componentName: 'BoolSetter',
                                    defaultValue: false,
                                },
                            },
                        ],
                    },
                    {
                        title: '卡片内容',
                        type: 'group',
                        extraProps: {
                            display: 'block',
                        },
                        items: [
                            {
                                name: 'title',
                                title: '标题内容',
                                setter: 'StringSetter',
                            },
                            {
                                name: 'header',
                                title: '头部',
                                setter: {
                                    componentName: 'SlotSetter',
                                    defaultValue: {
                                        type: 'JSSlot',
                                        title: '头部',
                                        value: [],
                                    },
                                },
                            },
                            {
                                name: 'header-extra',
                                title: '头部附加',
                                setter: {
                                    componentName: 'SlotSetter',
                                    defaultValue: {
                                        type: 'JSSlot',
                                        title: '头部附加',
                                        value: [],
                                    },
                                },
                            },
                            {
                                name: 'footer',
                                title: '底部',
                                setter: {
                                    componentName: 'SlotSetter',
                                    defaultValue: {
                                        type: 'JSSlot',
                                        title: '底部',
                                        value: [],
                                    },
                                },
                            },
                            {
                                name: 'action',
                                title: '操作区',
                                setter: {
                                    componentName: 'SlotSetter',
                                    defaultValue: {
                                        type: 'JSSlot',
                                        title: '操作区',
                                        value: [],
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
            snippets: [
                {
                    screenshot:
                        'https://helios-allpublic-1257616148.cos.ap-shanghai.myqcloud.com/img/card.png',
                    title: '卡片',
                    schema: {
                        componentName: 'NCard',
                        children: [],
                    },
                },
            ],
            group: '原子组件',
            category: '布局组件',
            priority: 0,
        },
        {
            title: '文本',
            componentName: 'NText',
            npm: {
                package: 'naive-ui',
                version: '2.32.0',
                exportName: 'NText',
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
                                        label: 'default',
                                        value: 'default',
                                    },
                                    {
                                        label: 'success',
                                        value: 'success',
                                    },
                                    {
                                        label: 'info',
                                        value: 'info',
                                    },
                                    {
                                        label: 'warning',
                                        value: 'warning',
                                    },
                                    {
                                        label: 'error',
                                        value: 'error',
                                    },
                                ],
                            },
                            defaultValue: 'default',
                        },
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
                    screenshot:
                        'https://helios-allpublic-1257616148.cos.ap-shanghai.myqcloud.com/img/text.svg',
                    schema: {
                        componentName: 'NText',
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
            title: '间距',
            componentName: 'FSpace',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.17',
                exportName: 'FSpace',
                destructuring: true,
            },
            props: [
                {
                    name: 'align',
                    propType: 'string',
                },
                {
                    name: 'wrap-item',
                    propType: 'bool',
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
            ],
            configure: {
                component: {
                    isContainer: true,
                },
                props: [
                    {
                        name: 'align',
                        title: '垂直排列方式',
                        setter: {
                            componentName: 'SelectSetter',
                            props: {
                                options: [
                                    {
                                        label: 'start',
                                        value: 'start',
                                    },
                                    {
                                        label: 'end',
                                        value: 'end',
                                    },
                                    {
                                        label: 'center',
                                        value: 'center',
                                    },
                                    {
                                        label: 'baseline',
                                        value: 'baseline',
                                    },
                                    {
                                        label: 'stretch',
                                        value: 'stretch',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'start',
                    },
                    {
                        name: 'justify',
                        title: '水平排列方式',
                        setter: {
                            componentName: 'SelectSetter',
                            props: {
                                options: [
                                    {
                                        label: 'start',
                                        value: 'start',
                                    },
                                    {
                                        label: 'end',
                                        value: 'end',
                                    },
                                    {
                                        label: 'center',
                                        value: 'center',
                                    },
                                    {
                                        label: 'space-around',
                                        value: 'space-around',
                                    },
                                    {
                                        label: 'space-between',
                                        value: 'space-between',
                                    },
                                    {
                                        label: 'space-evenly',
                                        value: 'space-evenly',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'start',
                    },
                    {
                        name: 'wrap-item',
                        title: '是否包裹元素',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'inline',
                        title: '是否为行内元素',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'vertical',
                        title: '是否垂直布局',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'wrap',
                        title: '是否超出换行',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'item-style',
                        title: '节点样式',
                        setter: 'StringSetter',
                    },
                ],
            },
            snippets: [
                {
                    screenshot:
                        'https://helios-allpublic-1257616148.cos.ap-shanghai.myqcloud.com/img/space.svg',
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
                version: '0.7.17',
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
                            },
                            {
                                name: 'loading',
                                title: '显示加载状态',
                                setter: 'BoolSetter',
                            },
                            {
                                name: 'throttle',
                                title: '截流',
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
                                                label: 'button',
                                                value: 'button',
                                            },
                                            {
                                                label: 'submit',
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
                                                label: 'primary',
                                                value: 'primary',
                                            },
                                            {
                                                label: 'text',
                                                value: 'text',
                                            },
                                            {
                                                label: 'link',
                                                value: 'link',
                                            },
                                            {
                                                label: 'info',
                                                value: 'info',
                                            },
                                            {
                                                label: 'info',
                                                value: 'info',
                                            },
                                            {
                                                label: 'success',
                                                value: 'success',
                                            },
                                            {
                                                label: 'warning',
                                                value: 'warning',
                                            },
                                            {
                                                label: 'danger',
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
                                                label: 'small',
                                                value: 'small',
                                            },
                                            {
                                                label: 'medium',
                                                value: 'medium',
                                            },
                                            {
                                                label: 'large',
                                                value: 'large',
                                            },
                                        ],
                                    },
                                },
                                defaultValue: 'medium',
                            },
                            {
                                name: 'long',
                                title: '长按钮',
                                setter: 'BoolSetter',
                            },
                        ],
                    },
                ],
                supports: {
                    style: true,
                    loop: true,
                    events: ['onClick'],
                },
            },
            snippets: [
                {
                    title: '按钮',
                    screenshot:
                        'https://helios-allpublic-1257616148.cos.ap-shanghai.myqcloud.com/img/button.png',
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
                version: '0.7.17',
                exportName: 'FForm',
                destructuring: true,
            },
            props: [
                {
                    name: 'disabled',
                    propType: 'bool',
                },
                {
                    name: 'inline',
                    propType: 'bool',
                },
                {
                    name: 'label-width',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'number'],
                    },
                },
                {
                    name: 'label-align',
                    propType: {
                        type: 'oneOf',
                        value: ['left', 'right'],
                    },
                },
                {
                    name: 'label-placement',
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
                },
                component: {
                    isContainer: true,
                },
                props: [
                    {
                        name: 'model',
                        title: '表项值对象',
                        setter: 'ExpressionSetter',
                    },
                    {
                        name: 'rules',
                        title: '表项值对象',
                        setter: {
                            componentName: 'MixedSetter',
                            props: {
                                setters: ['ExpressionSetter', 'JsonSetter'],
                            },
                        },
                    },
                    {
                        name: 'disabled',
                        title: '是否禁用',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'inline',
                        title: '行内表单',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'label-width',
                        title: '标签宽度',
                        setter: {
                            componentName: 'MixedSetter',
                            props: {
                                setters: ['StringSetter', 'NumberSetter'],
                            },
                        },
                        defaultValue: 'auto',
                    },
                    {
                        name: 'label-align',
                        title: '标签文本对齐方式',
                        setter: {
                            componentName: 'RadioGroupSetter',
                            props: {
                                options: [
                                    {
                                        title: 'left',
                                        value: 'left',
                                    },
                                    {
                                        title: 'right',
                                        value: 'right',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'left',
                    },
                    {
                        name: 'label-placement',
                        title: '标签位置',
                        setter: {
                            componentName: 'RadioGroupSetter',
                            props: {
                                options: [
                                    {
                                        title: 'left',
                                        value: 'left',
                                    },
                                    {
                                        title: 'top',
                                        value: 'top',
                                    },
                                ],
                            },
                        },
                        defaultValue: 'left',
                    },
                ],
            },
            snippets: [
                {
                    screenshot:
                        'https://helios-allpublic-1257616148.cos.ap-shanghai.myqcloud.com/img/form.png',
                    title: '表单容器',
                    schema: {
                        componentName: 'FForm',
                        props: {
                            'label-width': 80,
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
                version: '0.7.17',
                exportName: 'FFormItem',
                destructuring: true,
            },
            props: [
                {
                    name: 'label',
                    propType: 'string',
                },
                {
                    name: 'label-align',
                    propType: 'string',
                },
                {
                    name: 'label-width',
                    propType: {
                        type: 'oneOfType',
                        value: ['string', 'number'],
                    },
                },
                {
                    name: 'label-placement',
                    propType: 'string',
                },
                {
                    name: 'prop',
                    propType: 'string',
                },
                {
                    name: 'rule',
                    propType: 'array',
                },
            ],
            configure: {
                component: {
                    isContainer: true,
                },
                supports: {
                    loop: true,
                    style: true,
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
                                name: 'show-label',
                                title: '显示标签',
                                setter: 'BoolSetter',
                                defaultValue: true,
                            },
                            {
                                name: 'label-align',
                                title: '文本对齐方式',
                                setter: {
                                    componentName: 'RadioGroupSetter',
                                    props: {
                                        options: [
                                            {
                                                title: 'left',
                                                value: 'left',
                                            },
                                            {
                                                title: 'right',
                                                value: 'right',
                                            },
                                        ],
                                    },
                                },
                                defaultValue: 'left',
                            },
                            {
                                name: 'label-width',
                                title: '标签宽度',
                                setter: {
                                    componentName: 'MixedSetter',
                                    props: {
                                        setters: [
                                            'StringSetter',
                                            'NumberSetter',
                                        ],
                                    },
                                },
                                defaultValue: 'auto',
                            },
                            {
                                name: 'label-placement',
                                title: '标签位置',
                                setter: {
                                    componentName: 'RadioGroupSetter',
                                    props: {
                                        options: [
                                            {
                                                title: 'left',
                                                value: 'left',
                                            },
                                            {
                                                title: 'top',
                                                value: 'top',
                                            },
                                        ],
                                    },
                                },
                                defaultValue: 'left',
                            },
                            {
                                name: 'label-style',
                                title: '标签样式',
                                setter: {
                                    componentName: 'MixedSetter',
                                    props: {
                                        setters: ['StringSetter', 'JsonSetter'],
                                    },
                                },
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
                                name: 'rule',
                                title: '校验规则',
                                setter: {
                                    componentName: 'MixedSetter',
                                    props: {
                                        setters: [
                                            'ExpressionSetter',
                                            'JsonSetter',
                                        ],
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
        },
        {
            title: '文本输入',
            componentName: 'FInput',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.17',
                exportName: 'FInput',
                destructuring: true,
            },
            props: [
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
                    name: 'v-model',
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
            ],
            configure: {
                props: [
                    {
                        name: 'v-model',
                        title: '输入值',
                        setter: 'StringSetter',
                    },
                    {
                        name: 'maxlength',
                        title: '最大长度',
                        setter: 'NumberSetter',
                    },
                    {
                        name: 'placeholder',
                        title: '输入占位符',
                        setter: 'StringSetter',
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
                        name: 'resize',
                        title: '是否缩放',
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
                    },
                    {
                        name: 'disabled',
                        title: '是否禁用',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'clearable',
                        title: '是否可清空',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'showPassword',
                        title: '是否显示密码图标',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'prefix',
                        title: '前缀',
                        setter: 'SlotSetter',
                    },
                ],
                supports: {
                    events: [
                        'onInput',
                        'onFocus',
                        'onBlur',
                        'onClear',
                        'onChange',
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
                            showPassword: true,
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
                version: '0.7.17',
                exportName: 'FInputNumber',
                destructuring: true,
            },
            props: [
                {
                    name: 'modelValue',
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
                    title: '输入占位符',
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
                version: '0.7.17',
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
                        title: '选项配置',
                        type: 'group',
                        extraProps: {
                            display: 'block',
                        },
                        items: [
                            {
                                name: 'options',
                                title: '选项',
                                setter: {
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
                                    },
                                },
                            },
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
                                name: 'filterable',
                                title: 'filter',
                                setter: 'FunctionSetter',
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
                                title: '指定弹窗挂载的节点',
                                setter: 'FunctionSetter',
                            },
                        ],
                    },
                ],
                supports: {
                    events: [
                        'change',
                        'visibleChange',
                        'removeTag',
                        'blur',
                        'focus',
                        'clear',
                        'scroll',
                        'search',
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
            title: '分割线',
            componentName: 'FDivider',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.17',
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
                },
                {
                    name: 'titlePlacement',
                    title: '文字位置',
                    propType: {
                        type: 'oneOf',
                        value: ['center', 'left', 'right'],
                    },
                },
            ],
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
                version: '0.7.17',
                exportName: 'FEllipsis',
                destructuring: true,
            },
            props: [
                {
                    name: 'line',
                    title: '多行省略',
                    propType: 'number',
                    defaultValue: 1,
                },
                {
                    name: 'content',
                    title: '文本内容',
                    propType: 'string',
                },
            ],
            configure: {
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
                version: '0.7.17',
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
                ],
                component: {
                    isContainer: true,
                    nestingRule: {
                        descendantWhitelist: [
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
                },
                {
                    title: '布局容器',
                    schema: {
                        componentName: 'FLayout',
                    },
                },
            ],
            group: '精选组件',
            category: '布局组件',
            priority: 0,
        },
        {
            title: '容器头部',
            componentName: 'FHeader',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.17',
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
                {
                    title: '容器头部',
                    schema: {
                        componentName: 'FHeader',
                    },
                },
            ],
            group: '精选组件',
            category: '布局组件',
            priority: 0,
        },
        {
            title: '容器侧边栏',
            componentName: 'FAside',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.17',
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
                {
                    title: '容器侧边栏',
                    schema: {
                        componentName: 'FAside',
                    },
                },
            ],
            group: '精选组件',
            category: '布局组件',
            priority: 0,
        },
        {
            title: '容器主体',
            componentName: 'FMain',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.17',
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
                {
                    title: '容器主体',
                    schema: {
                        componentName: 'FMain',
                    },
                },
            ],
            group: '精选组件',
            category: '布局组件',
            priority: 0,
        },
        {
            title: '容器底部',
            componentName: 'FFooter',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.17',
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
                {
                    title: '容器底部',
                    schema: {
                        componentName: 'FFooter',
                    },
                },
            ],
            group: '精选组件',
            category: '布局组件',
            priority: 0,
        },
        {
            title: '下拉菜单',
            componentName: 'FDropdown',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.17',
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
                        type: 'field',
                        setter: {
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
                                            // {
                                            //     name: 'icon',
                                            //     title: '图标',
                                            //     setter: '',
                                            // },
                                        ],
                                    },
                                },
                            },
                        },
                        extraProps: {
                            display: 'block',
                        },
                    },
                    {
                        title: '功能',
                        type: 'group',
                        extraProps: {
                            display: 'block',
                        },
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
            },
            snippets: [
                {
                    title: '下拉菜单',
                    schema: {
                        componentName: 'FDropdown',
                        props: {},
                        children: [
                            {
                                componentName: 'FButton',
                                children: '下拉菜单',
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
                version: '0.7.17',
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
                        setter: 'NumberSetter',
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
                            defaultValue: 'process',
                        },
                    },
                    {
                        name: 'vertical',
                        title: '是否垂直方向',
                        setter: 'BoolSetter',
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
                version: '0.7.17',
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
                        setter: [
                            {
                                componentName: 'StringSetter',
                                defaultValue: '我是标题',
                            },
                        ],
                    },
                    {
                        name: 'description',
                        title: '描述',
                        setter: [
                            {
                                componentName: 'StringSetter',
                                defaultValue: '我是描述',
                            },
                        ],
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
                        setter: 'SlotSetter',
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
                version: '0.7.17',
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
                        extraProps: {
                            display: 'block',
                        },
                        items: [
                            {
                                name: 'v-model:currentPage',
                                title: '当前页码',
                                setter: 'NumberSetter',
                                defaultValue: 1,
                            },
                            {
                                name: 'v-model:pageSize',
                                title: '每页个数',
                                setter: 'NumberSetter',
                                defaultValue: 10,
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
                        extraProps: {
                            display: 'block',
                        },
                        items: [
                            {
                                name: 'showQuickJumper',
                                title: '快速跳转',
                                setter: 'BoolSetter',
                            },
                            {
                                name: 'showTotal',
                                title: '总条数',
                                setter: 'BoolSetter',
                            },
                            {
                                name: 'small',
                                title: '小型样式',
                                setter: 'BoolSetter',
                            },
                            {
                                name: 'simple',
                                title: '简洁样式',
                                setter: 'BoolSetter',
                            },
                        ],
                    },
                    {
                        title: '每页条数选择器',
                        type: 'group',
                        extraProps: {
                            display: 'block',
                        },
                        items: [
                            {
                                name: 'showSizeChanger',
                                title: '开启',
                                setter: 'BoolSetter',
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
                component: {},
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
    ],
    sort: {
        groupList: ['精选组件', '原子组件'],
        categoryList: [
            '基础元素',
            '布局组件',
            '导航组件',
            '数据录入',
            '信息展示',
            '信息反馈',
            '对话框类',
            '通用类',
        ],
    },
};

export default assets;
