import type {
    IPublicTypeEventHandler,
    IPublicTypeFieldConfig,
    IPublicTypeJSFunction,
    IPublicTypeSettingTarget,

    IPublicTypeTransformedComponentMetadata,
} from '@webank/letgo-types';
import {
    EventHandlerAction,
} from '@webank/letgo-types';
import { engineConfig } from '@webank/letgo-editor-core';
import { isArray } from 'lodash-es';

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
    const combined: IPublicTypeFieldConfig[] = [
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
                    name: '___events___',
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
                                const result: {
                                    [key: string]: IPublicTypeJSFunction[]
                                } = {};
                                componentEvents.forEach((item: IPublicTypeEventHandler) => {
                                    if (item.callId && item.method) {
                                        let expression: string;
                                        const params: string[] = [];
                                        if (item.action === EventHandlerAction.CONTROL_QUERY) {
                                            expression = `${item.callId}.${item.method}()`;
                                        }
                                        else if (item.action === EventHandlerAction.CONTROL_COMPONENT) {
                                            // TODO 支持参数
                                            expression = `${item.callId}.${item.method}()`;
                                        }
                                        else if (item.action === EventHandlerAction.GO_TO_URL) {
                                            params.push(item.url);
                                            expression = `${item.callId}.${item.method}.apply(${item.callId}, Array.prototype.slice.call(arguments))')`;
                                        }
                                        else if (item.action === EventHandlerAction.GO_TO_PAGE) {
                                            // TODO 支持参数
                                            expression = `${item.callId}.${item.method}('${item.pageId}')`;
                                        }
                                        else if (item.action === EventHandlerAction.SET_TEMPORARY_STATE) {
                                            // TODO 支持其他方法
                                            params.push(item.value);
                                            expression = `${item.callId}.${item.method}.apply(${item.callId}, Array.prototype.slice.call(arguments))`;
                                        }
                                        else if (item.action === EventHandlerAction.SET_LOCAL_STORAGE) {
                                            // TODO 支持其他方法
                                            if (item.method === 'setValue') {
                                                params.push(item.key, item.value);
                                                expression = `${item.callId}.${item.method}.apply(null, Array.prototype.slice.call(arguments))`;
                                            }
                                            else {
                                                expression = `${item.callId}.${item.method}()`;
                                            }
                                        }
                                        result[item.name] = (result[item.name] || []).concat({
                                            type: 'JSFunction',
                                            // 需要传下入参
                                            value: `function(){${expression}}`,
                                            params,
                                        });
                                    }
                                });
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
                name: '___condition___',
                title: '是否渲染',
                defaultValue: true,
                setter: [
                    {
                        componentName: 'BoolSetter',
                    },
                    {
                        componentName: 'VariableSetter',
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
                        name: '___loop___',
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
                                componentName: 'VariableSetter',
                            },
                        ],
                    },
                    {
                        name: '___loopArgs___.0',
                        title: '迭代变量名',
                        setter: {
                            componentName: 'StringSetter',
                            props: {
                                placeholder: '默认为: item',
                            },
                        },
                    },
                    {
                        name: '___loopArgs___.1',
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
                        title: '循环标识（Key）',
                        setter: [
                            {
                                componentName: 'StringSetter',
                            },
                            {
                                componentName: 'VariableSetter',
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
                        componentName: 'VariableSetter',
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
            if (supportVariableGlobally) {
                const setter = field.setter;
                if (isArray(setter)) {
                    if (!setter.includes('VariableSetter'))
                        setter.push('VariableSetter');
                }
                else if (setter) {
                    if (setter !== 'VariableSetter')
                        field.setter = [setter, 'VariableSetter'];
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

    return {
        ...metadata,
        ...basicInfo,
        configure: {
            ...configure,
            combined,
        },
    };
}
