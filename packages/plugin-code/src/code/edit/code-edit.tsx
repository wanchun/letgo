import { defineComponent } from 'vue';
import { TEMPORARY_STATE } from '../../constants';
import useCode from '../useCode';

import StateEdit from './state-edit';

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
            }

            return null;
        };
    },
});
