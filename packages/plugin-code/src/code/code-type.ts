import type { CodeItem, JavascriptComputed, JavascriptQuery, TemporaryState } from '../interface';
import { JAVASCRIPT_COMPUTED, JAVASCRIPT_QUERY, TEMPORARY_STATE } from '../constants';

export interface CodeTypeEdit {
    addCode(id: string): CodeItem
}

class TemporaryStateEdit implements CodeTypeEdit {
    addCode(id: string): TemporaryState {
        return {
            id,
            type: TEMPORARY_STATE,
            initValue: '',
        };
    }
}

class JavascriptComputedEdit implements CodeTypeEdit {
    addCode(id: string): JavascriptComputed {
        return {
            id,
            type: JAVASCRIPT_COMPUTED,
            funcBody: 'return 5',
        };
    }
}

class JavascriptQueryEdit implements CodeTypeEdit {
    addCode(id: string): JavascriptQuery {
        return {
            id,
            type: JAVASCRIPT_QUERY,
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

export const codeTypeEdit = {
    [JAVASCRIPT_QUERY]: new JavascriptQueryEdit(),
    [JAVASCRIPT_COMPUTED]: new JavascriptComputedEdit(),
    [TEMPORARY_STATE]: new TemporaryStateEdit(),
};
