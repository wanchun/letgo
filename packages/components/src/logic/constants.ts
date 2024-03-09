import { IEnumCodeType, IEnumResourceType } from '@webank/letgo-types';
import { ComputedIcon, JsIcon, RestIcon, StateIcon } from '../icons';

export const IconMap = {
    [IEnumCodeType.JAVASCRIPT_FUNCTION]: JsIcon,
    [IEnumCodeType.JAVASCRIPT_COMPUTED]: ComputedIcon,
    [IEnumCodeType.TEMPORARY_STATE]: StateIcon,
    [IEnumCodeType.JAVASCRIPT_QUERY]: RestIcon,
};

export const ResourceTypeIcon = {
    [IEnumResourceType.Query]: JsIcon,
    [IEnumResourceType.RESTQuery]: RestIcon,
};
