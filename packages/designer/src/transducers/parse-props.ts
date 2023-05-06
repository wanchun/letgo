import type {
    IPublicTypeArrayOf,
    IPublicTypeConfigureSupportEvent,
    IPublicTypeFieldConfig,
    IPublicTypeObjectOf,
    IPublicTypeOneOf,
    IPublicTypeOneOfType,
    IPublicTypeProp,
    IPublicTypePropConfig,
    IPublicTypeSetterType,
    IPublicTypeTransformedComponentMetadata,
} from '@webank/letgo-types';
import { isArray } from 'lodash-es';

function propConfigToFieldConfig(propConfig: IPublicTypePropConfig): IPublicTypeFieldConfig {
    return {
        ...propConfig,
        setter: propTypeToSetter(propConfig.propType),
    };
}

function propTypeToSetter(propType: IPublicTypeProp): IPublicTypeSetterType {
    let typeName: string;
    let isRequired: boolean | undefined = false;
    if (typeof propType === 'string') {
        typeName = propType;
    }
    else if (typeof propType === 'object') {
        typeName = propType.type;
        isRequired = propType.isRequired;
    }
    else {
        typeName = 'string';
    }
    // TODO: use mixinSetter wrapper
    switch (typeName) {
        case 'string':
            return {
                componentName: 'StringSetter',
                isRequired,
                defaultValue: '',
            };
        case 'number':
            return {
                componentName: 'NumberSetter',
                isRequired,
                defaultValue: 0,
            };
        case 'bool':
            return {
                componentName: 'BoolSetter',
                isRequired,
                defaultValue: false,
            };
        case 'oneOf':
            const dataSource = ((propType as IPublicTypeOneOf).value || []).map(
                (value, index) => {
                    const t = typeof value;
                    return {
                        label:
                            t === 'string' || t === 'number' || t === 'boolean'
                                ? String(value)
                                : `value ${index}`,
                        value,
                    };
                },
            );
            const componentName
                = dataSource.length >= 4 ? 'SelectSetter' : 'RadioGroupSetter';
            return {
                componentName,
                props: { dataSource, options: dataSource },
                isRequired,
                defaultValue: dataSource[0] ? dataSource[0].value : null,
            };

        case 'element':
        case 'node': // TODO: use Mixin
            return {
                // slotSetter
                componentName: 'SlotSetter',
                props: {
                    mode: typeName,
                },
                isRequired,
                defaultValue: {
                    type: 'JSSlot',
                    value: [],
                },
            };
        case 'shape':
        case 'exact':
            const items = ((propType as any).value || []).map((item: any) =>
                propConfigToFieldConfig(item),
            );
            return {
                componentName: 'ObjectSetter',
                props: {
                    items,
                    extraSetter:
                        typeName === 'shape' ? propTypeToSetter('any') : null,
                },
                isRequired,
                defaultValue: (field: any) => {
                    const data: any = {};
                    items.forEach((item: any) => {
                        let initial = item.defaultValue;
                        if (
                            initial == null
                            && item.setter
                            && typeof item.setter === 'object'
                        )
                            initial = (item.setter as any).defaultValue;

                        data[item.name] = initial
                            ? typeof initial === 'function'
                                ? initial(field)
                                : initial
                            : null;
                    });
                    return data;
                },
            };
        case 'object':
        case 'objectOf':
            return {
                componentName: 'ObjectSetter',
                props: {
                    extraSetter: propTypeToSetter(
                        typeName === 'objectOf'
                            ? (propType as IPublicTypeObjectOf).value
                            : 'any',
                    ),
                },
                isRequired,
                defaultValue: {},
            };
        case 'array':
        case 'arrayOf':
            return {
                componentName: 'ArraySetter',
                props: {
                    itemSetter: propTypeToSetter(
                        typeName === 'arrayOf'
                            ? (propType as IPublicTypeArrayOf).value
                            : 'any',
                    ),
                },
                isRequired,
                defaultValue: [],
            };
        case 'func':
            return {
                componentName: 'FunctionSetter',
                isRequired,
            };
        case 'color':
            return {
                componentName: 'ColorSetter',
                isRequired,
            };
        case 'oneOfType':
            return {
                componentName: 'MixedSetter',
                props: {
                    // TODO:
                    setters: (propType as IPublicTypeOneOfType).value.map(item =>
                        propTypeToSetter(item),
                    ),
                },
                isRequired,
            };
        default:
        // do nothing
    }
    return {
        componentName: 'MixedSetter',
        isRequired,
        props: {},
    };
}

const EVENT_RE = /^on|after|before[A-Z][\w]*$/;

export default function (
    metadata: IPublicTypeTransformedComponentMetadata,
): IPublicTypeTransformedComponentMetadata {
    const { configure = {} } = metadata;

    // 如果已配置 configure.props，则不转换
    if (isArray(configure.props))
        return metadata;

    if (!metadata.props) {
        return {
            ...metadata,
            configure: {
                ...configure,
                props: [],
            },
        };
    }

    const { component = {}, supports = {} } = configure;
    const supportedEvents: IPublicTypeConfigureSupportEvent[] | null = supports.events
        ? null
        : [];
    const props: IPublicTypeFieldConfig[] = [];

    metadata.props.forEach((prop) => {
        const { name, propType, description } = prop;
        if (
            name === 'children'
            && (component.isContainer
                || propType === 'node'
                || propType === 'element'
                || propType === 'any')
        ) {
            if (component.isContainer !== false) {
                component.isContainer = true;
                props.push(propConfigToFieldConfig(prop));
                return;
            }
        }

        if (
            EVENT_RE.test(name)
            && (propType === 'func' || propType === 'any')
        ) {
            if (supportedEvents) {
                supportedEvents.push({
                    name,
                    description,
                });
                supports.events = supportedEvents;
            }
            return;
        }

        if (name === 'class' && (propType === 'string' || propType === 'any')) {
            if (supports.class == null)
                supports.class = true;

            return;
        }

        if (name === 'style' && (propType === 'object' || propType === 'any')) {
            if (supports.style == null)
                supports.style = true;

            return;
        }

        props.push(propConfigToFieldConfig(prop));
    });

    return {
        ...metadata,
        configure: {
            ...configure,
            props,
            supports,
            component,
        },
    };
}
