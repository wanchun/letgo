import { NpmInfo } from './npm';
import { JSExpression, JSFunction } from './valueType';

export type InternalUtils = {
    name: string;
    type: 'function';
    content: JSFunction | JSExpression;
};

export type ExternalUtils = {
    name: string;
    type: 'npm' | 'wnpm';
    content: NpmInfo;
};

export type UtilItem = InternalUtils | ExternalUtils;
export type UtilsMap = UtilItem[];
