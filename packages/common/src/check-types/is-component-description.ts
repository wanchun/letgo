import type { IPublicTypeComponentDescription, IPublicTypeRemoteComponentDescription } from '@webank/letgo-types';
import { isRemoteComponentDescription } from './is-remote-component-description';

export function isComponentDescription(data: IPublicTypeComponentDescription | IPublicTypeRemoteComponentDescription): data is IPublicTypeComponentDescription {
    return !isRemoteComponentDescription(data);
}
