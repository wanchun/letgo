import { IEnumCodeType, IEnumResourceType } from '@webank/letgo-types';
import { ComputedIcon, JsIcon, RestIcon, StateIcon, lifecycleIcon } from '@webank/letgo-components';

export const IconMap = {
    [IEnumCodeType.JAVASCRIPT_FUNCTION]: JsIcon,
    [IEnumCodeType.JAVASCRIPT_COMPUTED]: ComputedIcon,
    [IEnumCodeType.TEMPORARY_STATE]: StateIcon,
    [IEnumCodeType.JAVASCRIPT_QUERY]: RestIcon,
    [IEnumCodeType.LIFECYCLE_HOOK]: lifecycleIcon,
};

export const ResourceTypeIcon = {
    [IEnumResourceType.Query]: JsIcon,
    [IEnumResourceType.RESTQuery]: RestIcon,
};
