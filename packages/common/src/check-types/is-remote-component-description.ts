import type { IPublicTypeRemoteComponentDescription } from '@webank/letgo-types';

export function isRemoteComponentDescription(data: any): data is IPublicTypeRemoteComponentDescription {
    if (typeof data === 'object')
        return !!(data.exportName && data.url);

    return false;
}
