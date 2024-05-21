import type { IEnumCodeType, IPublicEnumPageLifecycle, IPublicEnumProjectLifecycle } from '@webank/letgo-types';

export interface ICodeBaseImpl {
    id: string;
    get view(): Record<string, any>;
    changeId: (id: string) => void;
    changeContent: (content: Record<string, any>) => void;
}

export interface ITemporaryStateImpl extends ICodeBaseImpl {
    type: IEnumCodeType.TEMPORARY_STATE;
    changeDeps: (deps: string[]) => void;
}

export interface IJavascriptComputedImpl extends ICodeBaseImpl {
    type: IEnumCodeType.JAVASCRIPT_COMPUTED;
    changeDeps: (deps: string[]) => void;
}

export interface IJavascriptQueryImpl extends ICodeBaseImpl {
    type: IEnumCodeType.JAVASCRIPT_QUERY;
    changeDeps: (deps: string[]) => void;
    trigger: () => void;
}

export interface IJavascriptFunctionImpl extends ICodeBaseImpl {
    type: IEnumCodeType.JAVASCRIPT_FUNCTION;
    changeDeps: (deps: string[]) => void;
    trigger: () => void;
}

export interface ILifecycleImpl extends ICodeBaseImpl {
    hookName: IPublicEnumPageLifecycle | IPublicEnumProjectLifecycle;
    run: () => void;
    type: IEnumCodeType.LIFECYCLE_HOOK;
    changeDeps: (deps: string[]) => void;
}

export type CodeImplType = ITemporaryStateImpl | IJavascriptComputedImpl | IJavascriptQueryImpl | IJavascriptFunctionImpl | ILifecycleImpl;
