import { defineComponent, h } from 'vue';
import { IPublicEnumJSType, type IPublicModelSettingField, type IPublicTypeComponentMetadata } from '@webank/letgo-types';
import { getConvertedExtraKey } from '@webank/letgo-common';
import { isEqual, isObject } from 'lodash-es';

export const Component = defineComponent((props, { slots }) => {
    return () => h('div', { class: 'letgo-component', style: props.style }, slots);
});

const JS_TYPE_OPTIONS = [
    {
        label: '文本',
        value: IPublicEnumJSType.String,
    },
    {
        label: '数字',
        value: IPublicEnumJSType.Number,
    },
    {
        label: '布尔',
        value: IPublicEnumJSType.Boolean,
    },
    {
        label: '函数',
        value: IPublicEnumJSType.Function,
    },
    {
        label: '数组',
        value: IPublicEnumJSType.Array,
    },
    {
        label: '对象',
        value: IPublicEnumJSType.Object,
    },
];

const TYPE_TO_SETTER = {
    String: ['StringSetter', 'SelectSetter', 'RadioGroupSetter', 'TextAreaSetter', 'TimeSetter', 'ColorSetter', 'IconSetter'],
    Number: ['NumberSetter', 'SelectSetter', 'RadioGroupSetter', 'DateSetter'],
    Boolean: ['BoolSetter', 'RadioGroupSetter'],
    Object: ['ObjectSetter'],
    Array: ['ArraySetter'],
    Function: ['FunctionSetter'],
};

const propsWeakMap = new WeakMap();

export const ComponentMeta: IPublicTypeComponentMetadata = {
    title: '低代码组件',
    componentName: 'Component',
    configure: {
        props: [
            {
                name: getConvertedExtraKey('definedProps'),
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
                                                    options: JS_TYPE_OPTIONS,
                                                },
                                            },
                                        },
                                        {
                                            name: 'propSetter',
                                            title: '设置器',
                                            condition(target: IPublicModelSettingField) {
                                                return target.parent.getPropValue('type') === IPublicEnumJSType.String;
                                            },
                                            setter: {
                                                componentName: 'SelectSetter',
                                                props: {
                                                    options: TYPE_TO_SETTER.String.map((item) => {
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
                                                return target.parent.getPropValue('type') === IPublicEnumJSType.Number;
                                            },
                                            setter: {
                                                componentName: 'SelectSetter',
                                                props: {
                                                    options: TYPE_TO_SETTER.Number.map((item) => {
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
                                                return target.parent.getPropValue('type') === IPublicEnumJSType.Boolean;
                                            },
                                            setter: {
                                                componentName: 'SelectSetter',
                                                props: {
                                                    options: TYPE_TO_SETTER.Boolean.map((item) => {
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
                                                return target.parent.getPropValue('type') === IPublicEnumJSType.Function;
                                            },
                                            setter: {
                                                componentName: 'SelectSetter',
                                                props: {
                                                    options: TYPE_TO_SETTER.Function.map((item) => {
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
                                                return target.parent.getPropValue('type') === IPublicEnumJSType.Object;
                                            },
                                            setter: {
                                                componentName: 'SelectSetter',
                                                props: {
                                                    options: TYPE_TO_SETTER.Object.map((item) => {
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
                                                return target.parent.getPropValue('type') === IPublicEnumJSType.Array;
                                            },
                                            setter: {
                                                componentName: 'SelectSetter',
                                                props: {
                                                    options: TYPE_TO_SETTER.Array.map((item) => {
                                                        return {
                                                            label: item,
                                                            value: item,
                                                        };
                                                    }),
                                                },
                                            },
                                        },
                                        {
                                            name: 'items',
                                            title: '子项设置',
                                            display: 'block',
                                            condition(target: IPublicModelSettingField) {
                                                return ['SelectSetter', 'RadioGroupSetter'].includes(target.parent.getPropValue('propSetter')) && target.parent.getPropValue('type') === IPublicEnumJSType.String;
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
                                                    columns: ['label', 'value'],
                                                },
                                            },
                                        },
                                        {
                                            name: 'items',
                                            title: '子项设置',
                                            display: 'block',
                                            condition(target: IPublicModelSettingField) {
                                                return ['SelectSetter', 'RadioGroupSetter'].includes(target.parent.getPropValue('propSetter')) && target.parent.getPropValue('type') === IPublicEnumJSType.Boolean;
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
                                            name: 'items',
                                            title: '子项设置',
                                            display: 'block',
                                            condition(target: IPublicModelSettingField) {
                                                return ['SelectSetter', 'RadioGroupSetter'].includes(target.parent.getPropValue('propSetter')) && target.parent.getPropValue('type') === IPublicEnumJSType.Number;
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
                                                    options: JS_TYPE_OPTIONS.filter(item => item.value !== IPublicEnumJSType.Array),
                                                },
                                            },
                                        },
                                        {
                                            name: 'arrayItems',
                                            title: '数组子项设置',
                                            display: 'block',
                                            condition(target: IPublicModelSettingField) {
                                                return target.parent.getPropValue('propSetter') === 'ArraySetter' && target.parent.getPropValue('arrayItemType') === IPublicEnumJSType.Object;
                                            },
                                            setter: {
                                                componentName: 'ArraySetter',
                                                props: {
                                                    infinite: true,
                                                },
                                            },
                                        },
                                        {
                                            name: 'objectItems',
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
                            columns: ['title', 'name'],
                        },
                    },
                    'JsonSetter',
                ],
                supportVariable: false,
                onChange(field: IPublicModelSettingField) {
                    const top = field.top;
                    const definedProps = top.getExtraPropValue('definedProps');
                    const defaultProps = top.getExtraPropValue('defaultProps');
                    const props: Record<string, any> = {};
                    if (isObject(defaultProps)) {
                        Object.keys(defaultProps).forEach((key) => {
                            if ((definedProps as any[]).find(item => item.name === key))
                                props[key] = defaultProps[key as keyof typeof defaultProps];
                        });
                    }
                    top.setExtraPropValue('defaultProps', props);
                },
            },
            {
                name: getConvertedExtraKey('defaultProps'),
                title: '默认值',
                display: 'block',
                setter: {
                    componentName: 'ObjectSetter',
                    props(field: IPublicModelSettingField) {
                        const definedProps = field.parent.getExtraPropValue('definedProps');
                        const newProps = {
                            items: (definedProps || []).filter((item: any) => item && item.name).map((item: any) => {
                                const { name, title, propSetter, type, items } = item;
                                let setter = propSetter;
                                if (!setter)
                                    setter = type ? TYPE_TO_SETTER[type as keyof typeof TYPE_TO_SETTER][0] : 'StringSetter';

                                if (['ObjectSetter', 'ArraySetter'].includes(setter))
                                    setter = 'JsonSetter';

                                const props: Record<string, any> = {};

                                if (['SelectSetter', 'RadioGroupSetter'].includes(setter))
                                    props.options = (items || []).filter(Boolean);

                                return {
                                    name,
                                    title,
                                    setter: {
                                        componentName: setter,
                                        props,
                                    },
                                };
                            }),
                        };
                        const preProps = propsWeakMap.get(field);
                        if (!preProps || !isEqual(preProps, newProps)) {
                            propsWeakMap.set(field, newProps);
                            return newProps;
                        }

                        return preProps;
                    },
                },
                supportVariable: false,
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
