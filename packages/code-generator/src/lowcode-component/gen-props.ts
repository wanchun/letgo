import type {
    IPublicTypeComponentSchema,
    IPublicTypeJSFunction,
} from '@webank/letgo-types';
import { normalizeProp } from './helper';

const TYPE_TO_PROP_TYPE = {
    string: 'String',
    number: 'Number',
    boolean: 'Boolean',
    object: 'Object',
    array: 'Array',
    function: 'Function',
} as const;

interface Option {
    label: string;
    value: string | number | boolean;
}
export interface PropDefine {
    name: string;
    title: string;
    type?: keyof typeof TYPE_TO_PROP_TYPE;
    propSetter?: string;
    items?: Option[];
    arrayItemType?: keyof typeof TYPE_TO_PROP_TYPE;
    arrayItems?: PropDefine[];
    objectItems?: PropDefine[];
}

export function genProps(rootSchema: IPublicTypeComponentSchema) {
    const { props, defaultProps = {} } = rootSchema;
    const propsStr = ((props.propsDefinition || []) as unknown as PropDefine[]).map((item) => {
        const propType = TYPE_TO_PROP_TYPE[item.type || 'string'];
        if (defaultProps[item.name] == null) { return `${item.name}: ${propType}`; }
        else if (['object', 'array'].includes(item.type)) {
            return `${item.name}: {
                type: ${propType},
                default: () => {
                    return ${JSON.stringify(defaultProps[item.name])}
                }
            }`;
        }
        else if (item.type === 'function') {
            if ((defaultProps[item.name] as IPublicTypeJSFunction).value) {
                return `${item.name}: {
                    type: ${propType},
                    default: ${(defaultProps[item.name] as IPublicTypeJSFunction).value}
                }`;
            }
            return null;
        }
        else {
            return `${item.name}: {
                type: ${propType},
                default: ${normalizeProp(defaultProps[item.name])}
            }`;
        }
    });

    return propsStr.filter(Boolean).join(',\n');
}
