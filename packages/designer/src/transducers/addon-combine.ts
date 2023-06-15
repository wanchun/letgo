import type {
    IPublicTypeFieldConfig,
    IPublicTypeSettingTarget,

    IPublicTypeTransformedComponentMetadata,
} from '@webank/letgo-types';
import { engineConfig } from '@webank/letgo-editor-core';
import { isArray } from 'lodash-es';
import { eventHandlersToJsExpression } from '@webank/letgo-common';
import { getConvertedExtraKey } from '../node';

export default function (
    metadata: IPublicTypeTransformedComponentMetadata,
): IPublicTypeTransformedComponentMetadata {
    const { componentName, configure = {} } = metadata;

    // 如果已经处理过，不再重新执行一遍
    if (configure.combined)
        return metadata;

    const { props, supports = {} } = configure;
    const isRoot: boolean
        = componentName === 'Page' || componentName === 'Component';
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
    if (supports.class) {
        stylesGroup.push({
            name: 'class',
            title: '绑定类名',
            setter: 'ClassNameSetter',
        });
    }
    if (supports.style) {
        stylesGroup.push({
            name: 'style',
            title: '行内样式',
            setter: 'StyleSetter',
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
                        getValue(field: IPublicTypeSettingTarget, val?: any[]) {
                            return val;
                        },
                        setValue(field: IPublicTypeSettingTarget, eventData) {
                            const { componentEvents, eventList } = eventData;

                            if (Array.isArray(eventList)) {
                                eventList.map((item) => {
                                    field.parent.clearPropValue(item.value);
                                    return item;
                                });
                            }

                            if (Array.isArray(componentEvents)) {
                                const result = eventHandlersToJsExpression(componentEvents);
                                Object.keys(result).forEach((name) => {
                                    field.parent.setPropValue(name, result[name]);
                                });
                            }
                        },
                    },
                },
            ],
        });
    }

    if (!isRoot) {
        if (supports.condition !== false) {
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
        if (supports.loop !== false) {
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
                        setter: {
                            componentName: 'StringSetter',
                            props: {
                                placeholder: '默认为: index',
                            },
                        },
                    },
                    {
                        name: 'key',
                        title: '循环标识（Key）',
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

        if (supports.condition !== false || supports.loop !== false) {
            advancedGroup.push({
                name: 'key',
                title: '渲染唯一标识（key）',
                setter: [
                    {
                        componentName: 'StringSetter',
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
    }
    else {
        advancedGroup.push(
            {
                name: getConvertedExtraKey('fileName'),
                title: '页面路径',
                setter: 'StringSetter',
            },
        );
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
            if (supportVariableGlobally) {
                const setter = field.setter;
                if (isArray(setter)) {
                    if (!setter.includes('ExpressionSetter') && !setter.includes('VariableSetter'))
                        setter.push('ExpressionSetter');
                }
                else if (typeof setter === 'string') {
                    if (setter !== 'ExpressionSetter' && setter !== 'VariableSetter')
                        field.setter = [setter, 'ExpressionSetter'];
                }
                else if (setter) {
                    const setters = (setter.props as any)?.setters;
                    if (setter.componentName === 'MixedSetter') {
                        if (!setters?.includes('ExpressionSetter') && !setters?.includes('VariableSetter'))
                            setters?.push('ExpressionSetter');
                    }
                    else if (setter.componentName !== 'ExpressionSetter' && setter.componentName !== 'VariableSetter') {
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
