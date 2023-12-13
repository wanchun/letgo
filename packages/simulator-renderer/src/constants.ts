import { getGlobalContextKey, getPageContextKey } from '@webank/letgo-renderer';

export const BASE_COMP_CONTEXT = getPageContextKey();
export const BASE_GLOBAL_CONTEXT = getGlobalContextKey();
