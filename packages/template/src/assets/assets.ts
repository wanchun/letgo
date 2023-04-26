import { AssetsJson } from '@webank/letgo-types';

const assets: AssetsJson = {
    packages: [
        {
            package: '@fesjs/fes-design',
            version: '0.7.21',
            urls: [
                'https://unpkg.com/@fesjs/fes-design@0.7.21/dist/fes-design.js',
                'https://unpkg.com/@fesjs/fes-design@0.7.21/dist/fes-design.css',
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
            title: '图片',
            componentName: 'img',
            props: [
                {
                    name: 'src',
                    title: '地址',
                    propType: 'string',
                },
            ],
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
            group: '原子组件',
            category: '基础元素',
            priority: 0,
        },
        {
            title: '卡片',
            componentName: 'FCard',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.21',
                exportName: 'FSpace',
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
                        value: ['small', 'medium', 'large'],
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
                                name: 'divider',
                                title: '显示分割线',
                                setter: 'BoolSetter',
                            },
                            {
                                name: 'shadow',
                                title: '阴影效果',
                                setter: {
                                    componentName: 'RadioGroupSetter',
                                    props: {
                                        options: [
                                            {
                                                label: 'always',
                                                value: 'always',
                                            },
                                            {
                                                label: 'never',
                                                value: 'never',
                                            },
                                            {
                                                label: 'hover',
                                                value: 'hover',
                                            },
                                        ],
                                    },
                                    defaultValue: 'always',
                                },
                            },
                            {
                                name: 'bodyStyle',
                                title: '内容样式',
                                setter: 'ObjectSetter',
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
                                name: 'header',
                                title: '标题内容',
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
                ],
            },
            snippets: [
                {
                    screenshot:
                        'https://helios-allpublic-1257616148.cos.ap-shanghai.myqcloud.com/img/card.png',
                    title: '卡片',
                    schema: {
                        componentName: 'FCard',
                        children: [],
                    },
                },
            ],
            group: '原子组件',
            category: '布局组件',
            priority: 0,
        },
        {
            title: '间距',
            componentName: 'FSpace',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.21',
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
                version: '0.7.21',
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
                version: '0.7.21',
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
                version: '0.7.21',
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
                version: '0.7.21',
                exportName: 'FInput',
                destructuring: true,
            },
            props: [
                {
                    name: 'modelValue',
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
                        name: 'modelValue',
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
                version: '0.7.21',
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
                version: '0.7.21',
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
            title: '多选框组',
            componentName: 'FCheckboxGroup',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.21',
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
                        title: '选中的值',
                        extraProps: {
                            display: 'block',
                        },
                        setter: {
                            componentName: 'ArraySetter',
                            props: {
                                itemSetter: ['StringSetter', 'NumberSetter'],
                            },
                        },
                    },
                    {
                        name: 'vertical',
                        title: '垂直排列',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'disabled',
                        title: '是否禁用',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'options',
                        title: '选项配置',
                        extraProps: {
                            display: 'block',
                        },
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
                                        ],
                                    },
                                },
                            },
                        },
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
            title: '多选框',
            componentName: 'FCheckbox',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.21',
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
                        title: '是否选中',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'value',
                        title: '内容',
                        setter: ['StringSetter', 'NumberSetter'],
                        condition: (target) => {
                            return (
                                target.top.getNode().parent.componentName ===
                                'FCheckboxGroup'
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
                    },
                    {
                        name: 'indeterminate',
                        title: '部分选中',
                        setter: 'BoolSetter',
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
            title: '单选组',
            componentName: 'FRadioGroup',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.21',
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
                        title: '选中的值',
                        extraProps: {
                            display: 'block',
                        },
                        setter: {
                            componentName: 'ArraySetter',
                            props: {
                                itemSetter: ['StringSetter', 'NumberSetter'],
                            },
                        },
                    },
                    {
                        name: 'vertical',
                        title: '垂直排列',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'disabled',
                        title: '是否禁用',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'cancelable',
                        title: '是否可取消',
                        setter: 'BoolSetter',
                    },
                    {
                        name: 'options',
                        title: '选项配置',
                        extraProps: {
                            display: 'block',
                        },
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
                                        ],
                                    },
                                },
                            },
                        },
                    },
                    {
                        title: '类型配置',
                        type: 'group',
                        extraProps: {
                            display: 'block',
                        },
                        items: [
                            {
                                name: 'optionType',
                                title: '选项类型',
                                setter: {
                                    componentName: 'SelectSetter',
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
                                    componentName: 'SelectSetter',
                                    props: {
                                        options: [
                                            {
                                                value: 'default',
                                                label: 'default',
                                            },
                                            {
                                                value: 'primary',
                                                label: 'primary',
                                            },
                                        ],
                                    },
                                },
                                defaultValue: 'default',
                                condition: (target) => {
                                    const val =
                                        target.top.getPropValue('optionType');
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
                                    const val =
                                        target.top.getPropValue('optionType');
                                    return val === 'button';
                                },
                            },
                            {
                                name: 'bordered',
                                title: '按钮是否边框',
                                setter: 'BoolSetter',
                                defaultValue: true,
                                condition: (target) => {
                                    const val =
                                        target.top.getPropValue('optionType');
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
                    title: '单选框组',
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
                {
                    title: '单选按钮组',
                    schema: {
                        componentName: 'FRadioGroup',
                        props: {
                            optionType: 'button',
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
            title: '单选框',
            componentName: 'FRadio',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.21',
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
                        title: '是否选中',
                        setter: 'BoolSetter',
                        defaultValue: false,
                    },
                    {
                        name: 'value',
                        title: '内容',
                        setter: ['StringSetter', 'NumberSetter'],
                        condition: (target) => {
                            return (
                                target.top.getNode().parent.componentName ===
                                'FRadioGroup'
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
                version: '0.7.21',
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
                version: '0.7.21',
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
            componentName: '',
            title: '',
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
            ],
            group: '精选组件',
            category: '布局组件',
            priority: 0,
        },
        {
            title: '布局容器',
            componentName: 'FLayout',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.21',
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
                    title: '布局容器',
                    schema: {
                        componentName: 'FLayout',
                    },
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
                version: '0.7.21',
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
            group: '原子组件',
            category: '布局组件',
            priority: 0,
        },
        {
            title: '容器侧边栏',
            componentName: 'FAside',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.21',
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
            group: '原子组件',
            category: '布局组件',
            priority: 0,
        },
        {
            title: '容器主体',
            componentName: 'FMain',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.21',
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
            group: '原子组件',
            category: '布局组件',
            priority: 0,
        },
        {
            title: '容器底部',
            componentName: 'FFooter',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.21',
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
            group: '原子组件',
            category: '布局组件',
            priority: 0,
        },
        {
            title: '下拉菜单',
            componentName: 'FDropdown',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.21',
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
                version: '0.7.21',
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
                version: '0.7.21',
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
                version: '0.7.21',
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
        {
            title: '开关',
            componentName: 'FSwitch',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.21',
                exportName: 'FSwitch',
                destructuring: true,
            },
            props: [
                {
                    name: 'activeValue',
                    title: '开启的值',
                    propType: {
                        type: 'oneOfType',
                        value: ['bool', 'string', 'number'],
                    },
                },
                {
                    name: 'inactiveValue',
                    title: '关闭的值',
                    propType: {
                        type: 'oneOfType',
                        value: ['bool', 'string', 'number'],
                    },
                },
                {
                    name: 'v-model',
                    title: '当前值',
                    propType: {
                        type: 'oneOfType',
                        value: ['bool', 'string', 'number'],
                    },
                },
                {
                    name: 'disabled',
                    title: '是否禁用',
                    propType: 'bool',
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
                version: '0.7.21',
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
                    name: 'appendToContainer',
                    title: '弹窗是是否挂载到容器',
                    propType: 'bool',
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
                },
                {
                    name: 'disabled',
                    title: '是否禁用',
                    propType: 'bool',
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
                },
                {
                    name: 'hourStep',
                    title: '小时选项间隔',
                    propType: 'number',
                },
                {
                    name: 'minuteStep',
                    title: '分钟选项间隔',
                    propType: 'number',
                },
                {
                    name: 'secondStep',
                    title: '秒钟选项间隔',
                    propType: 'number',
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
                },
            ],
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
                version: '0.7.21',
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
                    name: 'type',
                    title: '类型',
                    propType: 'string',
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
                },
                {
                    name: 'disabled',
                    title: '是否禁用',
                    propType: 'bool',
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
                },
                {
                    name: 'hourStep',
                    title: '小时选项间隔',
                    propType: 'number',
                },
                {
                    name: 'minuteStep',
                    title: '分钟选项间隔',
                    propType: 'number',
                },
                {
                    name: 'secondStep',
                    title: '秒钟选项间隔',
                    propType: 'number',
                },
                {
                    name: 'control',
                    title: '是否显示控制区域',
                    propType: 'bool',
                },
            ],
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
                version: '0.7.21',
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
            ],
            snippets: [
                {
                    title: '上传',
                    schema: {
                        componentName: 'FUpload',
                        props: {},
                    },
                },
            ],
            group: '原子组件',
            category: '数据录入',
            priority: 0,
        },
        {
            title: '树形选择器',
            componentName: 'FSelectTree',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.21',
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
                    name: 'appendToContainer',
                    title: '弹窗是是否挂载到容器',
                    propType: 'bool',
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
                },
                {
                    name: 'disabled',
                    title: '是否禁用',
                    propType: 'bool',
                },
                {
                    name: 'collapseTags',
                    title: '选项是否折叠展示',
                    propType: 'bool',
                },
                {
                    name: 'collapseTagsLimit',
                    title: '达到多少折叠',
                    propType: 'number',
                },
                {
                    name: 'tagBordered',
                    title: '选项是否有边框',
                    propType: 'bool',
                },
                {
                    name: 'emptyText',
                    title: '选项为空的提示文字',
                    propType: 'string',
                },
                {
                    name: 'multiple',
                    title: '是否多选',
                    propType: 'bool',
                },
                {
                    name: 'multipleLimit',
                    title: '最多选择几个',
                    propType: 'number',
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
                    name: 'accordion',
                    title: '手风琴模式',
                    propType: 'bool',
                },
                {
                    name: 'defaultExpandAll',
                    title: '默认展开所有选项',
                    propType: 'bool',
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
                    name: 'cascade',
                    title: '父子节点选中是否关联',
                    propType: 'bool',
                },
                {
                    name: 'checkStrictly',
                    title: '勾选策略',
                    propType: {
                        type: 'oneOf',
                        value: ['all', 'parent', 'child'],
                    },
                },
                {
                    name: 'childrenField',
                    title: 'children字段名',
                    propType: 'string',
                },
                {
                    name: 'valueField',
                    title: 'value字段名',
                    propType: 'string',
                },
                {
                    name: 'labelField',
                    title: 'label字段名',
                    propType: 'string',
                },
                {
                    name: 'remote',
                    title: '是否异步加载',
                    propType: 'bool',
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
                },
                {
                    name: 'virtualList',
                    title: '是否虚拟滚动',
                    propType: 'bool',
                },
            ],
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
                version: '0.7.21',
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
                    name: 'appendToContainer',
                    title: '弹窗是是否挂载到容器',
                    propType: 'bool',
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
                },
                {
                    name: 'disabled',
                    title: '是否禁用',
                    propType: 'bool',
                },
                {
                    name: 'collapseTags',
                    title: '选项是否折叠展示',
                    propType: 'bool',
                },
                {
                    name: 'collapseTagsLimit',
                    title: '达到多少折叠',
                    propType: 'number',
                },
                {
                    name: 'tagBordered',
                    title: '选项是否有边框',
                    propType: 'bool',
                },
                {
                    name: 'emptyText',
                    title: '选项为空的提示文字',
                    propType: 'string',
                },
                {
                    name: 'multiple',
                    title: '是否多选',
                    propType: 'bool',
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
                    name: 'cascade',
                    title: '父子节点选中是否关联',
                    propType: 'bool',
                },
                {
                    name: 'checkStrictly',
                    title: '勾选策略',
                    propType: {
                        type: 'oneOf',
                        value: ['all', 'parent', 'child'],
                    },
                },
                {
                    name: 'childrenField',
                    title: 'children字段名',
                    propType: 'string',
                },
                {
                    name: 'valueField',
                    title: 'value字段名',
                    propType: 'string',
                },
                {
                    name: 'labelField',
                    title: 'label字段名',
                    propType: 'string',
                },
                {
                    name: 'remote',
                    title: '是否异步加载',
                    propType: 'bool',
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
                },
                {
                    name: 'emitPath',
                    title: '值是否包含路径',
                    propType: 'bool',
                },
                {
                    name: 'showPath',
                    title: '是否显示路径',
                    propType: 'bool',
                },
            ],
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
                version: '0.7.21',
                exportName: 'FCarousel',
                destructuring: true,
            },
            configure: {
                component: {
                    isContainer: true,
                },
            },
            props: [
                {
                    name: 'height',
                    title: '高度',
                    propType: 'string',
                },
                {
                    name: 'initialIndex',
                    title: '初始索引',
                    propType: 'number',
                },
                {
                    name: 'trigger',
                    title: '指示器触发方式',
                    propType: {
                        type: 'oneOf',
                        value: ['click', 'hover'],
                    },
                },
                {
                    name: 'autoplay',
                    title: '自动切换',
                    propType: 'bool',
                },
                {
                    name: 'interval',
                    title: '自动切换间隔',
                    propType: 'number',
                },
                {
                    name: 'indicatorType',
                    title: '指示器类型',
                    propType: {
                        type: 'oneOf',
                        value: ['linear', 'dot'],
                    },
                },
                {
                    name: 'indicatorPlacement',
                    title: '指示器摆放方向',
                    propType: {
                        type: 'oneOf',
                        value: ['top', 'right', 'bottom', 'left'],
                    },
                },
                {
                    name: 'indicatorPosition',
                    title: '指示器位置',
                    propType: {
                        type: 'oneOf',
                        value: ['outside', 'none', ''],
                    },
                },
                {
                    name: 'showArrow',
                    title: '箭头显示',
                    propType: {
                        type: 'oneOf',
                        value: ['always', 'hover', 'never'],
                    },
                },
                {
                    name: 'type',
                    title: '类型',
                    propType: {
                        type: 'oneOf',
                        value: ['', 'card'],
                    },
                },
                {
                    name: 'loop',
                    title: '循环',
                    propType: 'bool',
                },
                {
                    name: 'pauseOnHover',
                    title: '悬浮暂停',
                    propType: 'bool',
                },
            ],
            snippets: [
                {
                    title: '走马灯',
                    schema: {
                        componentName: 'FCarousel',
                        props: {},
                        children: [],
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
                version: '0.7.21',
                exportName: 'FCarouselItem',
                destructuring: true,
            },
            props: [],
            configure: {
                component: {
                    isContainer: true,
                },
            },
            snippets: [
                {
                    title: '走马灯',
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
            componentName: '',
            title: '',
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
                                        componentName: 'img',
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
                                        componentName: 'img',
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
                            {
                                componentName: 'FCarouselItem',
                                children: [
                                    {
                                        componentName: 'img',
                                        props: {
                                            src: 'https://s3.bmp.ovh/imgs/2022/01/ebaa3c3133c9e964.png',
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
                                        componentName: 'img',
                                        props: {
                                            src: 'https://s3.bmp.ovh/imgs/2022/01/2f68ed8e26dc519b.png',
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
            group: '精选组件',
            category: '信息展示',
            priority: 0,
        },
        {
            title: '折叠面板',
            componentName: 'FCollapse',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.21',
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
                },
                {
                    name: 'arrow',
                    title: '箭头位置',
                    propType: {
                        type: 'oneOf',
                        value: ['left', 'right'],
                    },
                },
            ],
            configure: {
                component: {
                    isContainer: true,
                },
            },
            snippets: [
                {
                    title: '折叠面板',
                    schema: {
                        componentName: 'FCollapse',
                        children: [],
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
                version: '0.7.21',
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
                },
            ],
            configure: {
                component: {
                    isContainer: true,
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
            componentName: '',
            title: '',
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
                                    '岁月静好，浅笑安然。打开记忆的闸门，仿佛又回到了那年那月那时光，仿佛又见到你送给我的那盆清香茉莉，在细雨潇潇的夜晚，所呈现出来的洁净和楚楚动人。以前的过往总是在记忆深处，以固有的姿态，以从未稍离的执着提醒我，生命中有一种存在，叫以前。',
                                ],
                            },
                            {
                                componentName: 'FCollapseItem',
                                props: {
                                    name: '2',
                                    title: 'Feedback',
                                },
                                children: [
                                    '生活是蜿蜒在山中的小径，坎坷不平，沟崖在侧。摔倒了，要哭就哭吧，怕什么，不心装模作样！这是直率，不是软弱，因为哭一场并不影响赶路，反而能增添一份留意。山花烂漫，景色宜人，如果陶醉了，想笑就笑吧，不心故作矜持！这是直率，不是骄傲，因为笑一次并不影响赶路，反而能增添一份信心。',
                                ],
                            },
                            {
                                componentName: 'FCollapseItem',
                                props: {
                                    name: '3',
                                    title: 'Efficiency',
                                },
                                children: [
                                    '喜欢一种情意，浅浅淡淡，不远不近。念起便有一种沁心的暖，知心的柔。岁月轮转，韶华渐老，惟愿人依旧安静，温雅。世事经年，惟愿情怀依旧宁静如初。静默时光的彼岸，就让我宁心等待一场必然来临的春暖花开。即使偶尔会有心潮澎湃，亦是沉寂中的安恬与端庄。',
                                ],
                            },
                            {
                                componentName: 'FCollapseItem',
                                props: {
                                    name: '4',
                                    title: 'Controllability',
                                },
                                children: [
                                    '一弯月光，风飘云漫，多少个明月夜，寂寞走不出思念的射线，静静的听你梦中的心跳，轻嗅你唇边的香息，柔醉你缱绻的缠绵。衣袂飘飘，心香瓣瓣，在飘渺的细雨中，衍生了无尽的眷恋。用一生的深情与你凝眸相拥，朝夕相伴。幽篁深处，落叶与娇花相随，你我的沉醉，静默了一池山水。',
                                ],
                            },
                        ],
                    },
                },
            ],
            group: '精选组件',
            category: '信息展示',
            priority: 0,
        },
        {
            title: '描述列表',
            componentName: 'FDescriptions',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.21',
                exportName: 'FDescriptions',
                destructuring: true,
            },
            props: [
                {
                    name: 'column',
                    title: '总列数',
                    propType: 'number',
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
                    name: 'labelAlign',
                    title: '标签对齐方式',
                    propType: {
                        type: 'oneOf',
                        value: ['left', 'center', 'right'],
                    },
                },
                {
                    name: 'labelPlacement',
                    title: '标签位置',
                    propType: {
                        type: 'oneOf',
                        value: ['left', 'top'],
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
                {
                    name: 'separator',
                    title: '分隔符',
                    propType: 'string',
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
                },
            ],
            configure: {
                component: {
                    isContainer: true,
                },
            },
            snippets: [
                {
                    title: '描述列表',
                    schema: {
                        componentName: 'FDescriptions',
                        children: [],
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
                version: '0.7.21',
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
            componentName: '',
            title: '',
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
                                children: ['万xx'],
                            },
                            {
                                componentName: 'FDescriptionsItem',
                                props: {
                                    label: '性别',
                                },
                                children: ['男'],
                            },
                            {
                                componentName: 'FDescriptionsItem',
                                props: {
                                    label: '年龄',
                                },
                                children: ['60'],
                            },
                            {
                                componentName: 'FDescriptionsItem',
                                props: {
                                    label: '身份证',
                                },
                                children: ['4222202166606061212'],
                            },
                            {
                                componentName: 'FDescriptionsItem',
                                props: {
                                    label: '血型',
                                },
                                children: ['A'],
                            },
                        ],
                    },
                },
            ],
            group: '精选组件',
            category: '信息展示',
            priority: 0,
        },
        {
            title: '图片',
            componentName: 'FImage',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.21',
                exportName: 'FImage',
                destructuring: true,
            },
            props: [
                {
                    name: 'alt',
                    title: '描述',
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
                    name: 'src',
                    title: '图片地址',
                    propType: 'string',
                },
                {
                    name: 'preview',
                    title: '是否预览',
                    propType: 'bool',
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
                    name: 'lazy',
                    title: '懒加载',
                    propType: 'bool',
                },
                {
                    name: 'scrollContainer',
                    title: '懒加载监听节点',
                    propType: 'element',
                },
                {
                    name: 'hideOnClickModal',
                    title: '点击遮罩层关闭预览',
                    propType: 'bool',
                },
                {
                    name: 'previewContainer',
                    title: '预览挂载节点',
                    propType: 'func',
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
                },
            ],
            snippets: [
                {
                    title: '图片',
                    schema: {
                        componentName: 'FImage',
                    },
                },
            ],
            group: '原子组件',
            category: '信息展示',
            priority: 0,
        },
        {
            title: '图片组',
            componentName: 'FPreviewGroup',
            npm: {
                package: '@fesjs/fes-design',
                version: '0.7.21',
                exportName: 'FPreviewGroup',
                destructuring: true,
            },
            props: [
                {
                    name: 'hideOnClickModal',
                    title: '点击遮罩层关闭预览',
                    propType: 'bool',
                },
            ],
            configure: {
                component: {
                    isContainer: true,
                },
            },
            snippets: [
                {
                    title: '图片预览组',
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
    ],
    sort: {
        groupList: ['原子组件', '精选组件'],
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
