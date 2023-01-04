import {
    TransformedComponentMetadata,
    FieldConfig,
    SettingTarget,
} from '@webank/letgo-types';

export default function (
    metadata: TransformedComponentMetadata,
): TransformedComponentMetadata {
    const { componentName, configure = {} } = metadata;

    // 如果已经处理过，不再重新执行一遍
    if (configure.combined) {
        return metadata;
    }

    const { props, supports = {} } = configure;
    const isRoot: boolean =
        componentName === 'Page' || componentName === 'Component';
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

    const stylesGroup: FieldConfig[] = [];
    const advancedGroup: FieldConfig[] = [];
    if (propsGroup) {
        let l = propsGroup.length;
        while (l-- > 0) {
            const item = propsGroup[l];
            if (
                item.name === '__style__' ||
                item.name === 'style' ||
                item.name === 'containerStyle' ||
                item.name === 'pageStyle'
            ) {
                propsGroup.splice(l, 1);
                stylesGroup.push(item);
                if (
                    item.extraProps?.defaultCollapsed &&
                    item.name !== 'containerStyle'
                ) {
                    item.extraProps.defaultCollapsed = false;
                }
            }
        }
    }
    const combined: FieldConfig[] = [
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
                        getValue(field: SettingTarget, val?: any[]) {
                            return val;
                        },
                        setValue(field: SettingTarget, eventData) {
                            const { eventDataList, eventList } = eventData;

                            if (Array.isArray(eventList)) {
                                eventList.map((item) => {
                                    field.parent.clearPropValue(item.name);
                                    return item;
                                });
                            }

                            if (Array.isArray(eventDataList)) {
                                eventDataList.map((item) => {
                                    field.parent.setPropValue(item.name, {
                                        type: 'JSFunction',
                                        // 需要传下入参
                                        value: `function(){this.${
                                            item.relatedEventName
                                        }.apply(this,Array.prototype.slice.call(arguments).concat([${
                                            item.paramStr ? item.paramStr : ''
                                        }])) }`,
                                    });
                                    return item;
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
                    display: 'accordion',
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

    return {
        ...metadata,
        ...basicInfo,
        configure: {
            ...configure,
            combined,
        },
    };
}
