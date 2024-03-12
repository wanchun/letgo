import type { IPublicTypeProjectSchema } from '@webank/letgo-types';
import { isPlainObject } from 'lodash-es';

export function isProjectSchema(data: any): data is IPublicTypeProjectSchema {
    if (!isPlainObject(data))
        return false;

    return 'componentsTree' in data;
}
