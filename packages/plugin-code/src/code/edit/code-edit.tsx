import { defineComponent } from 'vue';
import { JAVASCRIPT_COMPUTED, JAVASCRIPT_QUERY, TEMPORARY_STATE } from '../../constants';
import useCode from '../useCode';

import StateEdit from './state-edit';
import ComputedEdit from './computed-edit';
import QueryEdit from './query-edit/query-edit';

export default defineComponent({
    setup() {
        const {
            currentCodeItem,
            changeCodeItemContent,
        } = useCode();

        return () => {
            if (currentCodeItem.value) {
                if (currentCodeItem.value.type === TEMPORARY_STATE)
                    return <StateEdit codeItem={currentCodeItem.value} changeContent={changeCodeItemContent} />;
                if (currentCodeItem.value.type === JAVASCRIPT_COMPUTED)
                    return <ComputedEdit codeItem={currentCodeItem.value} changeContent={changeCodeItemContent} />;
                if (currentCodeItem.value.type === JAVASCRIPT_QUERY)
                    return <QueryEdit codeItem={currentCodeItem.value} changeContent={changeCodeItemContent} />;
            }

            return null;
        };
    },
});
