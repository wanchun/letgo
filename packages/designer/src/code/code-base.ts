import { IEnumCacheType, IEnumCodeType, IEnumResourceType, IEnumRunCondition } from '@webank/letgo-types';
import type {
    ICodeItem,
    IJavascriptComputed,
    IJavascriptFunction,
    IJavascriptQuery,
    ILifecycle,
    ITemporaryState,
} from '@webank/letgo-types';

export interface CodeBaseEdit {
    addCode: (id: string, params?: Record<string, any>) => ICodeItem;
}

class TemporaryStateEdit implements CodeBaseEdit {
    addCode(id: string): ITemporaryState {
        return {
            id,
            type: IEnumCodeType.TEMPORARY_STATE,
            initValue: '',
        };
    }
}

class JavascriptComputedEdit implements CodeBaseEdit {
    addCode(id: string): IJavascriptComputed {
        return {
            id,
            type: IEnumCodeType.JAVASCRIPT_COMPUTED,
            funcBody: 'return 5',
        };
    }
}

class JavascriptFunctionEdit implements CodeBaseEdit {
    addCode(id: string): IJavascriptFunction {
        return {
            id,
            type: IEnumCodeType.JAVASCRIPT_FUNCTION,
            funcBody: '// Tip: 函数 \n() => {\n  \n}',
        };
    }
}

class JavascriptQueryEdit implements CodeBaseEdit {
    addCode(id: string, params?: Record<string, any>): IJavascriptQuery {
        const otherFields: Record<string, any> = {};
        if (params?.resourceType === IEnumResourceType.RESTQuery) {
            otherFields.method = 'POST';
            otherFields.cacheType = IEnumCacheType.RAM;
            otherFields.enableTransformer = false;
            otherFields.transformer = '//变量data是原始响应结果  \nreturn data;';
        }

        return {
            id,
            resourceType: params?.resourceType || IEnumResourceType.Query,
            type: IEnumCodeType.JAVASCRIPT_QUERY,
            runCondition: IEnumRunCondition.Manual,
            query: '',
            enableCaching: false,
            queryTimeout: 10000,
            ...otherFields,
        };
    }
}

class Lifecycle implements CodeBaseEdit {
    addCode(id: string, params?: Partial<ILifecycle>): ILifecycle {
        return {
            id,
            type: IEnumCodeType.LIFECYCLE_HOOK,
            hookName: params?.hookName ?? '',
            funcBody: '// Tip: 编写代码',
        };
    }
}

export const codeBaseEdit = {
    [IEnumCodeType.JAVASCRIPT_QUERY]: new JavascriptQueryEdit(),
    [IEnumCodeType.JAVASCRIPT_COMPUTED]: new JavascriptComputedEdit(),
    [IEnumCodeType.TEMPORARY_STATE]: new TemporaryStateEdit(),
    [IEnumCodeType.JAVASCRIPT_FUNCTION]: new JavascriptFunctionEdit(),
    [IEnumCodeType.LIFECYCLE_HOOK]: new Lifecycle(),
};
