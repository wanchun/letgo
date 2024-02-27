import { defineComponent, h } from 'vue';
import type { IPublicModelSettingField, IPublicTypeComponentMetadata } from '@webank/letgo-types';
import { getConvertedExtraKey } from '@webank/letgo-common';

export const Component = defineComponent((props, { slots }) => {
    return () => h('div', { class: 'letgo-component', ...props }, slots);
});

const TYPE_TO_SETTER = {
    string: ['StringSetter', 'SelectSetter', 'RadioGroupSetter', 'TextAreaSetter', 'TimeSetter', 'ColorSetter', 'IconSetter'],
    number: ['NumberSetter', 'SelectSetter', 'RadioGroupSetter', 'DateSetter'],
    boolean: ['BoolSetter', 'RadioGroupSetter'],
    object: ['ObjectSetter'],
    array: ['ArraySetter'],
    function: ['FunctionSetter'],
};

export const ComponentMeta: IPublicTypeComponentMetadata = {
    title: '低代码组件',
    componentName: 'Component',
    configure: {
        props: [
            {
                name: 'propsDefinition',
                title: '属性自定义',
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
                                            title: '属性标题',
                                            setter: {
                                                componentName: 'StringSetter',
                                                props: {
                                                    placeholder: '文本内容',
                                                },
                                            },
                                        },
                                        {
                                            name: 'name',
                                            title: '属性名称',
                                            setter: {
                                                componentName: 'StringSetter',
                                                props: {
                                                    placeholder: 'content',
                                                },
                                            },
                                        },
                                        {
                                            name: 'type',
                                            title: '属性类型',
                                            condition(target: IPublicModelSettingField) {
                                                const type = target.getValue() as keyof typeof TYPE_TO_SETTER;
                                                const propSetter = target.parent.getPropValue('propSetter');
                                                if (type && (!propSetter || !TYPE_TO_SETTER[type].includes(propSetter)))
                                                    target.parent.setPropValue('propSetter', TYPE_TO_SETTER[type][0]);

                                                return true;
                                            },
                                            setter: {
                                                componentName: 'SelectSetter',
                                                props: {
                                                    options: [
                                                        {
                                                            label: '文本',
                                                            value: 'string',
                                                        },
                                                        {
                                                            label: '数字',
                                                            value: 'number',
                                                        },
                                                        {
                                                            label: '布尔',
                                                            value: 'boolean',
                                                        },
                                                        {
                                                            label: '函数',
                                                            value: 'function',
                                                        },
                                                        {
                                                            label: '数组',
                                                            value: 'array',
                                                        },
                                                        {
                                                            label: '对象',
                                                            value: 'object',
                                                        },
                                                    ],
                                                },
                                            },
                                        },
                                        {
                                            name: 'propSetter',
                                            title: '设置器',
                                            condition(target: IPublicModelSettingField) {
                                                return target.parent.getPropValue('type') === 'string';
                                            },
                                            setter: {
                                                componentName: 'SelectSetter',
                                                props: {
                                                    options: TYPE_TO_SETTER.string.map((item) => {
                                                        return {
                                                            label: item,
                                                            value: item,
                                                        };
                                                    }),
                                                },
                                            },
                                        },
                                        {
                                            name: 'propSetter',
                                            title: '设置器',
                                            condition(target: IPublicModelSettingField) {
                                                return target.parent.getPropValue('type') === 'number';
                                            },
                                            setter: {
                                                componentName: 'SelectSetter',
                                                props: {
                                                    options: TYPE_TO_SETTER.number.map((item) => {
                                                        return {
                                                            label: item,
                                                            value: item,
                                                        };
                                                    }),
                                                },
                                            },
                                        },
                                        {
                                            name: 'propSetter',
                                            title: '设置器',
                                            condition(target: IPublicModelSettingField) {
                                                return target.parent.getPropValue('type') === 'boolean';
                                            },
                                            setter: {
                                                componentName: 'SelectSetter',
                                                props: {
                                                    options: TYPE_TO_SETTER.boolean.map((item) => {
                                                        return {
                                                            label: item,
                                                            value: item,
                                                        };
                                                    }),
                                                },
                                            },
                                        },
                                        {
                                            name: 'propSetter',
                                            title: '设置器',
                                            condition(target: IPublicModelSettingField) {
                                                return target.parent.getPropValue('type') === 'function';
                                            },
                                            setter: {
                                                componentName: 'SelectSetter',
                                                props: {
                                                    options: TYPE_TO_SETTER.function.map((item) => {
                                                        return {
                                                            label: item,
                                                            value: item,
                                                        };
                                                    }),
                                                },
                                            },
                                        },
                                        {
                                            name: 'propSetter',
                                            title: '设置器',
                                            condition(target: IPublicModelSettingField) {
                                                return target.parent.getPropValue('type') === 'object';
                                            },
                                            setter: {
                                                componentName: 'SelectSetter',
                                                props: {
                                                    options: TYPE_TO_SETTER.object.map((item) => {
                                                        return {
                                                            label: item,
                                                            value: item,
                                                        };
                                                    }),
                                                },
                                            },
                                        },
                                        {
                                            name: 'propSetter',
                                            title: '设置器',
                                            condition(target: IPublicModelSettingField) {
                                                return target.parent.getPropValue('type') === 'array';
                                            },
                                            setter: {
                                                componentName: 'SelectSetter',
                                                props: {
                                                    options: TYPE_TO_SETTER.array.map((item) => {
                                                        return {
                                                            label: item,
                                                            value: item,
                                                        };
                                                    }),
                                                },
                                            },
                                        },
                                        {
                                            name: 'item',
                                            title: '子项设置',
                                            display: 'block',
                                            condition(target: IPublicModelSettingField) {
                                                return ['SelectSetter', 'RadioGroupSetter'].includes(target.parent.getPropValue('propSetter')) && target.parent.getPropValue('type') === 'string';
                                            },
                                            setter: {
                                                componentName: 'ArraySetter',
                                                props: {
                                                    itemSetter: {
                                                        componentName: 'ObjectSetter',
                                                        props: {
                                                            items: [
                                                                {
                                                                    name: 'label',
                                                                    title: '标签',
                                                                    setter: 'StringSetter',
                                                                },
                                                                {
                                                                    name: 'value',
                                                                    title: '值',
                                                                    setter: 'StringSetter',
                                                                },
                                                            ],
                                                        },
                                                    },
                                                    columns: [
                                                        {
                                                            name: 'label',
                                                            title: '标签',
                                                            setter: 'StringSetter',
                                                        },
                                                        {
                                                            name: 'value',
                                                            title: '值',
                                                            setter: 'StringSetter',
                                                        },
                                                    ],
                                                },
                                            },
                                        },
                                        {
                                            name: 'item',
                                            title: '子项设置',
                                            display: 'block',
                                            condition(target: IPublicModelSettingField) {
                                                return ['SelectSetter', 'RadioGroupSetter'].includes(target.parent.getPropValue('propSetter')) && target.parent.getPropValue('type') === 'boolean';
                                            },
                                            setter: {
                                                componentName: 'ArraySetter',
                                                props: {
                                                    itemSetter: {
                                                        componentName: 'ObjectSetter',
                                                        props: {
                                                            items: [
                                                                {
                                                                    name: 'label',
                                                                    title: '标签',
                                                                    setter: 'StringSetter',
                                                                },
                                                                {
                                                                    name: 'value',
                                                                    title: '值',
                                                                    setter: 'BoolSetter',
                                                                },
                                                            ],
                                                        },
                                                    },
                                                    columns: [
                                                        {
                                                            name: 'label',
                                                            title: '标签',
                                                            setter: 'StringSetter',
                                                        },
                                                        {
                                                            name: 'value',
                                                            title: '值',
                                                            setter: 'BoolSetter',
                                                        },
                                                    ],
                                                },
                                            },
                                        },
                                        {
                                            name: 'item',
                                            title: '子项设置',
                                            display: 'block',
                                            condition(target: IPublicModelSettingField) {
                                                return ['SelectSetter', 'RadioGroupSetter'].includes(target.parent.getPropValue('propSetter')) && target.parent.getPropValue('type') === 'number';
                                            },
                                            setter: {
                                                componentName: 'ArraySetter',
                                                props: {
                                                    itemSetter: {
                                                        componentName: 'ObjectSetter',
                                                        props: {
                                                            items: [
                                                                {
                                                                    name: 'label',
                                                                    title: '标签',
                                                                    setter: 'StringSetter',
                                                                },
                                                                {
                                                                    name: 'value',
                                                                    title: '值',
                                                                    setter: 'NumberSetter',
                                                                },
                                                            ],
                                                        },
                                                    },
                                                    columns: [
                                                        {
                                                            name: 'label',
                                                            title: '标签',
                                                            setter: 'StringSetter',
                                                        },
                                                        {
                                                            name: 'value',
                                                            title: '值',
                                                            setter: 'NumberSetter',
                                                        },
                                                    ],
                                                },
                                            },
                                        },
                                        {
                                            name: 'arrayItemType',
                                            title: '数组项类型',
                                            condition(target: IPublicModelSettingField) {
                                                return target.parent.getPropValue('propSetter') === 'ArraySetter';
                                            },
                                            setter: {
                                                componentName: 'SelectSetter',
                                                props: {
                                                    options: [
                                                        {
                                                            title: '文本',
                                                            value: 'string',
                                                        },
                                                        {
                                                            title: '数字',
                                                            value: 'number',
                                                        },
                                                        {
                                                            title: '布尔',
                                                            value: 'boolean',
                                                        },
                                                        {
                                                            title: '函数',
                                                            value: 'function',
                                                        },
                                                        {
                                                            title: '数组',
                                                            value: 'array',
                                                        },
                                                        {
                                                            title: '对象',
                                                            value: 'object',
                                                        },
                                                    ],
                                                },
                                            },
                                        },
                                        {
                                            name: 'arrayItem',
                                            title: '数组子项设置',
                                            display: 'block',
                                            condition(target: IPublicModelSettingField) {
                                                return target.parent.getPropValue('propSetter') === 'ArraySetter' && target.parent.getPropValue('arrayItemType') === 'object';
                                            },
                                            setter: {
                                                componentName: 'ArraySetter',
                                                props: {
                                                    infinite: true,
                                                },
                                            },
                                        },

                                        {
                                            name: 'objectItem',
                                            title: '对象属性设置器',
                                            display: 'block',
                                            condition(target: IPublicModelSettingField) {
                                                return target.parent.getPropValue('propSetter') === 'ObjectSetter';
                                            },
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
                                    name: 'title',
                                    title: '属性标题',
                                    setter: {
                                        componentName: 'StringSetter',
                                        props: {
                                            placeholder: '文本内容',
                                        },
                                    },
                                },
                                {
                                    name: 'name',
                                    title: '属性名称',
                                    setter: {
                                        componentName: 'StringSetter',
                                        props: {
                                            placeholder: 'content',
                                        },
                                    },
                                },
                            ],
                        },
                    },
                    'JsonSetter',
                ],
                supportVariable: false,
            },
            {
                name: getConvertedExtraKey('defaultProps'),
                title: '默认值',
                display: 'block',
                setter: {
                    componentName: 'ObjectSetter',
                    props(field: IPublicModelSettingField) {
                        const propsDefinition = field.parent.getPropValue('propsDefinition');
                        return {
                            items: (propsDefinition || []).filter((item: any) => item && item.name).map((item: any) => {
                                const { name, title, type } = item;
                                let setter = 'StringSetter';
                                if (type)
                                    setter = TYPE_TO_SETTER[type as keyof typeof TYPE_TO_SETTER][0];

                                if (['ObjectSetter', 'ArraySetter'].includes(setter))
                                    setter = 'JsonSetter';

                                return {
                                    name,
                                    title,
                                    setter,
                                };
                            }),
                        };
                    },
                },
            },
        ],

        supports: {
            style: true,
            condition: false,
            loop: false,
            events: [],
        },
        component: {
            isContainer: true,
            disableBehaviors: '*',
        },
    },

};
