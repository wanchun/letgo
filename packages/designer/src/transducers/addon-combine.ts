import type {
    IPublicTypeFieldConfig,
    IPublicTypeTransformedComponentMetadata,
} from '@webank/letgo-types';
import { engineConfig } from '@webank/letgo-editor-core';
import { isArray } from 'lodash-es';
import { getConvertedExtraKey } from '../node';

export default function (
    metadata: IPublicTypeTransformedComponentMetadata,
): IPublicTypeTransformedComponentMetadata {
    const { componentName, configure = {} } = metadata;

    // 如果已经处理过，不再重新执行一遍
    if (configure.combined)
        return metadata;

    const { props, supports = {} } = configure;
    const isRoot: boolean = componentName === 'Page' || componentName === 'Component';
    const isSlot: boolean = componentName === 'Slot';
    const eventsDefinition: any[] = [];
    if (supports.events) {
        eventsDefinition.push({
            type: 'events',
            title: '事件',
            list: (supports.events || []).map((event: any) =>
                typeof event === 'string' ? { name: event } : event,
            ),
        });
    }
    //  通用设置
    const propsGroup = props ? [...props] : [];
    const basicInfo: any = {};

    const stylesGroup: IPublicTypeFieldConfig[] = [];
    const advancedGroup: IPublicTypeFieldConfig[] = [];
    if (propsGroup) {
        let l = propsGroup.length;
        while (l-- > 0) {
            const item = propsGroup[l];
            if (item.name === 'style') {
                propsGroup.splice(l, 1);
                stylesGroup.push(item);
            }
        }
    }
    let combined: IPublicTypeFieldConfig[] = [
        {
            title: '属性',
            name: '#props',
            items: propsGroup,
        },
    ];
    // if (supports.class) {
    //     stylesGroup.push({
    //         name: 'class',
    //         title: '绑定类名',
    //         setter: 'ClassNameSetter',
    //     });
    // }
    if (supports.style) {
        stylesGroup.push({
            name: 'style',
            title: '行内样式',
            setter: ['StyleSetter', 'ExpressionSetter'],
            extraProps: {
                display: 'block',
            },
        });
    }
    if (stylesGroup.length > 0) {
        combined.push({
            name: '#styles',
            title: '样式',
            items: stylesGroup,
        });
    }

    if (eventsDefinition.length > 0) {
        combined.push({
            name: '#events',
            title: '事件',
            items: [
                {
                    name: getConvertedExtraKey('events'),
                    title: '事件设置',
                    setter: {
                        componentName: 'EventSetter',
                        props: {
                            definition: eventsDefinition,
                        },
                    },
                    extraProps: {
                        display: 'block',
                    },
                },
            ],
        });
    }

    if (isRoot) {
        advancedGroup.push(
            {
                name: getConvertedExtraKey('fileName'),
                title: '页面路径',
                setter: 'StringSetter',
            },
        );
        advancedGroup.push(
            {
                name: getConvertedExtraKey('title'),
                title: '页面中文名',
                setter: 'StringSetter',
            },
        );
    }
    else {
        if (!isSlot && supports.condition !== false) {
            advancedGroup.push({
                name: getConvertedExtraKey('condition'),
                title: '是否渲染',
                defaultValue: true,
                setter: [
                    {
                        componentName: 'BoolSetter',
                    },
                    {
                        componentName: 'ExpressionSetter',
                    },
                ],
                extraProps: {
                    display: 'block',
                },
            });
        }
        if (!isSlot && supports.loop !== false) {
            advancedGroup.push({
                name: '#loop',
                title: '循环',
                items: [
                    {
                        name: getConvertedExtraKey('loop'),
                        title: '循环数据',
                        setter: [
                            {
                                componentName: 'JsonSetter',
                                props: {
                                    label: '编辑数据',
                                },
                                defaultValue: '[]',
                            },
                            {
                                componentName: 'ExpressionSetter',
                            },
                        ],
                    },
                    {
                        name: `${getConvertedExtraKey('loopArgs')}.0`,
                        title: '迭代变量名',
                        setter: {
                            componentName: 'StringSetter',
                            props: {
                                placeholder: '默认为: item',
                            },
                        },
                    },
                    {
                        name: `${getConvertedExtraKey('loopArgs')}.1`,
                        title: '索引变量名',
                        setter: {
                            componentName: 'StringSetter',
                            props: {
                                placeholder: '默认为: index',
                            },
                        },
                    },
                    {
                        name: 'key',
                        title: '循环标识',
                        setter: [
                            {
                                componentName: 'StringSetter',
                            },
                            {
                                componentName: 'ExpressionSetter',
                            },
                        ],
                    },
                ],
                extraProps: {
                    display: 'block',
                },
            });
        }
    }

    if (advancedGroup.length > 0) {
        combined.push({
            name: '#advanced',
            title: '高级',
            items: advancedGroup,
        });
    }

    // 给属性增加变量设置器
    const supportVariableGlobally = engineConfig.get('supportVariableGlobally');
    function addVariableSetter(field: IPublicTypeFieldConfig) {
        if (field.items) {
            field.items.forEach((fieldConfig) => {
                addVariableSetter(fieldConfig);
            });
        }
        else if (field.setter) {
            const supportVariable = field.supportVariable ?? supportVariableGlobally;
            if (supportVariable) {
                const setter = field.setter;
                if (isArray(setter)) {
                    if (!setter.includes('ExpressionSetter'))
                        setter.push('ExpressionSetter');
                }
                else if (typeof setter === 'string') {
                    if (setter !== 'ExpressionSetter')
                        field.setter = [setter, 'ExpressionSetter'];
                }
                else if (setter) {
                    const setters = (setter.props as any)?.setters;
                    if (setter.componentName === 'MixedSetter') {
                        if (!setters?.includes('ExpressionSetter'))
                            setters?.push('ExpressionSetter');
                    }
                    else if (setter.componentName !== 'ExpressionSetter') {
                        field.setter = [setter, 'ExpressionSetter'];
                    }
                }
            }
        }
    }

    // 属性默认有这个
    if (propsGroup) {
        propsGroup.forEach((fieldConfig) => {
            addVariableSetter(fieldConfig);
        });
    }

    // 过滤掉没有配置的大项
    combined = combined.filter((item) => {
        return item.items.length;
    });

    return {
        ...metadata,
        ...basicInfo,
        configure: {
            ...configure,
            combined,
        },
    };
}
