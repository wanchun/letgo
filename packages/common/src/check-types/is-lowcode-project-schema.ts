import type { IPublicTypeComponentSchema, IPublicTypeProjectSchema } from '@webank/letgo-types';
import { isPlainObject } from 'lodash-es';
import { isComponentSchema } from './is-component-schema';

export function isLowcodeProjectSchema(data: any): data is IPublicTypeProjectSchema<IPublicTypeComponentSchema> {
    if (!isPlainObject(data))
        return false;

    if (!('componentsTree' in data) || data.componentsTree.length === 0)
        return false;

    return isComponentSchema(data.componentsTree[0]);
}
