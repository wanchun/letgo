import {
    IPublicEnumJSType,
    type IPublicTypeComponentSchema,
    type IPublicTypeJSFunction,
} from '@webank/letgo-types';
import { merge } from 'lodash-es';
import { normalizeProp } from './helper';

export function genProps(rootSchema: IPublicTypeComponentSchema) {
    const { definedProps, props, defaultProps = {} } = rootSchema;

    const currentProps = merge({}, props, defaultProps);

    const propsStr = ((definedProps || [])).map((item) => {
        const propType = item.type || 'String';
        if (currentProps[item.name] == null) { return `${item.name}: ${propType}`; }
        else if (['object', 'array'].includes(item.type)) {
            return `${item.name}: {
                type: ${propType},
                default: () => {
                    return ${JSON.stringify(currentProps[item.name])}
                }
            }`;
        }
        else if (item.type === IPublicEnumJSType.Function) {
            if ((currentProps[item.name] as IPublicTypeJSFunction).value) {
                return `${item.name}: {
                    type: ${propType},
                    default: ${(currentProps[item.name] as IPublicTypeJSFunction).value}
                }`;
            }
            return null;
        }
        else {
            return `${item.name}: {
                type: ${propType},
                default: ${normalizeProp(currentProps[item.name])}
            }`;
        }
    });

    return propsStr.filter(Boolean).join(',\n');
}
