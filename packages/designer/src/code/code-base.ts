import { uniqueId } from '@webank/letgo-common';
import { IEnumCodeType, IEnumResourceType, IEnumRunCondition } from '@webank/letgo-types';
import type {
    ICodeItem,
    IJavascriptComputed,
    IJavascriptFunction,
    IJavascriptQuery,
    ITemporaryState,
} from '@webank/letgo-types';

export interface CodeBaseEdit {
    addCode: (id: string, resourceType?: IEnumResourceType) => ICodeItem;
}

class TemporaryStateEdit implements CodeBaseEdit {
    addCode(id: string): ITemporaryState {
        const key = uniqueId(IEnumCodeType.TEMPORARY_STATE);
        return {
            key,
            id,
            type: IEnumCodeType.TEMPORARY_STATE,
            initValue: '',
        };
    }
}

class JavascriptComputedEdit implements CodeBaseEdit {
    addCode(id: string): IJavascriptComputed {
        const key = uniqueId(IEnumCodeType.JAVASCRIPT_COMPUTED);
        return {
            key,
            id,
            type: IEnumCodeType.JAVASCRIPT_COMPUTED,
            funcBody: '// Tip: 通过一个变量计算出新的变量，当依赖的变更更新时，新的变量自动更新 \nreturn 5',
        };
    }
}

class JavascriptFunctionEdit implements CodeBaseEdit {
    addCode(id: string): IJavascriptFunction {
        const key = uniqueId(IEnumCodeType.JAVASCRIPT_FUNCTION);
        return {
            key,
            id,
            type: IEnumCodeType.JAVASCRIPT_FUNCTION,
            funcBody: '// Tip: 函数 \nfunction func() {\n  \n}',
        };
    }
}

class JavascriptQueryEdit implements CodeBaseEdit {
    addCode(id: string, resourceType?: IEnumResourceType): IJavascriptQuery {
        const otherFields: Record<string, any> = {};
        if (resourceType === IEnumResourceType.RESTQuery) {
            otherFields.method = 'POST';
            otherFields.enableTransformer = false;
            otherFields.transformer = '//变量data是原始响应结果  \nreturn data;';
        }

        const key = uniqueId(IEnumCodeType.JAVASCRIPT_QUERY);

        return {
            key,
            id,
            resourceType: resourceType || IEnumResourceType.Query,
            type: IEnumCodeType.JAVASCRIPT_QUERY,
            runCondition: IEnumRunCondition.Manual,
            query: '',
            queryFailureCondition: [],
            showFailureToaster: false,
            showSuccessToaster: false,
            successMessage: '',
            enableCaching: false,
            queryTimeout: 10000,
            ...otherFields,
        };
    }
}

export const codeBaseEdit = {
    [IEnumCodeType.JAVASCRIPT_QUERY]: new JavascriptQueryEdit(),
    [IEnumCodeType.JAVASCRIPT_COMPUTED]: new JavascriptComputedEdit(),
    [IEnumCodeType.TEMPORARY_STATE]: new TemporaryStateEdit(),
    [IEnumCodeType.JAVASCRIPT_FUNCTION]: new JavascriptFunctionEdit(),
};
