import type EventEmitter from 'eventemitter3';

export type IPublicTypeEditorValueKey = (new (...args: any[]) => any) | symbol | string;

export interface IPublicTypeEditorGetOptions {
    forceNew?: boolean
    sourceCls?: new (...args: any[]) => any
}

export type IPublicTypeEditorGetResult<T, ClsType> = T extends undefined
    ? ClsType extends {
        prototype: infer R
    }
        ? R
        : any
    : T;

export interface IPublicTypeEditor extends EventEmitter {
    get: <T = undefined, KeyOrType = any>(
        keyOrType: KeyOrType,
        opt?: IPublicTypeEditorGetOptions,
    ) => IPublicTypeEditorGetResult<T, KeyOrType> | undefined

    has: (keyOrType: IPublicTypeEditorValueKey) => boolean

    set: (key: IPublicTypeEditorValueKey, data: any) => void

    onceGot: <T = undefined, KeyOrType extends IPublicTypeEditorValueKey = any>(
        keyOrType: KeyOrType,
    ) => Promise<IPublicTypeEditorGetResult<T, KeyOrType>>

    onGot: <T = undefined, KeyOrType extends IPublicTypeEditorValueKey = any>(
        keyOrType: KeyOrType,
        fn: (data: IPublicTypeEditorGetResult<T, KeyOrType>) => void,
    ) => () => void
}
