import { CodeType } from '@webank/letgo-types';
import type { CodeItem, IJavascriptComputed, IJavascriptQuery, ITemporaryState } from '@webank/letgo-types';

export interface CodeBaseEdit {
    addCode(id: string): CodeItem
}

class TemporaryStateEdit implements CodeBaseEdit {
    addCode(id: string): ITemporaryState {
        return {
            id,
            type: CodeType.TEMPORARY_STATE,
            initValue: '',
        };
    }
}

class JavascriptComputedEdit implements CodeBaseEdit {
    addCode(id: string): IJavascriptComputed {
        return {
            id,
            type: CodeType.JAVASCRIPT_COMPUTED,
            funcBody: '// Tip: 通过一个状态计算另一个状态 \n\nreturn 5',
        };
    }
}

class JavascriptQueryEdit implements CodeBaseEdit {
    addCode(id: string): IJavascriptQuery {
        return {
            id,
            type: CodeType.JAVASCRIPT_QUERY,
            enableTransformer: false,
            query: '',
            queryFailureCondition: [],
            showSuccessToaster: false,
            successMessage: '',
            enableCaching: false,
            queryTimeout: 10000,
            transformer: '',
        };
    }
}

export const codeBaseEdit = {
    [CodeType.JAVASCRIPT_QUERY]: new JavascriptQueryEdit(),
    [CodeType.JAVASCRIPT_COMPUTED]: new JavascriptComputedEdit(),
    [CodeType.TEMPORARY_STATE]: new TemporaryStateEdit(),
};
