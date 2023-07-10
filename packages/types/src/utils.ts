import type { IPublicTypeNpmInfo } from './npm';
import type { IPublicTypeJSFunction } from './value-type';

export interface IPublicTypeInternalUtils {
    name: string
    type: 'function'
    content: IPublicTypeJSFunction
}

export interface IPublicTypeExternalUtils {
    name: string
    type: 'npm' | 'wnpm'
    content: IPublicTypeNpmInfo
}

export type IPublicTypeUtilItem = IPublicTypeInternalUtils | IPublicTypeExternalUtils;
export type IPublicTypeUtilsMap = IPublicTypeUtilItem[];
