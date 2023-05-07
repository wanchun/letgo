import type { InjectionKey } from 'vue';
import type { CodeInject } from './interface';

export const JAVASCRIPT_QUERY = 'query';
export const JAVASCRIPT_COMPUTED = 'computed';
export const TEMPORARY_STATE = 'state';

export const CODE_INJECTION_KEY: InjectionKey<CodeInject>
    = Symbol('code');
