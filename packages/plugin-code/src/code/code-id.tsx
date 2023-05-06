import type { PropType } from 'vue';
import { defineComponent, nextTick, ref } from 'vue';
import { codeIdCls, editIconCls, idContentCls, inputCls } from './code-id.css';

import EditIcon from './edit-icon';

export default defineComponent({
    props: {
        id: String,
        onChange: Function as PropType<(id: string, preId: string) => void>,
    },
    setup(props) {
        const inputRefEl = ref<HTMLElement>();
        const editing = ref(false);
        const goEdit = () => {
            editing.value = true;
            nextTick(() => {
                inputRefEl.value.focus();
            });
        };
        const cancelEdit = () => {
            editing.value = false;
        };
        const changeId = (event: Event) => {
            props.onChange((event.target as HTMLInputElement).value, props.id);
            cancelEdit();
        };
        return () => {
            return <div class={codeIdCls}>
                <span v-show={!editing.value} class={idContentCls}>
                    <span>{props.id}</span>
                    <EditIcon onClick={goEdit} class={editIconCls} />
                </span>
                <input v-show={editing.value} ref={inputRefEl} class={inputCls} value={props.id} onBlur={cancelEdit} onChange={changeId} />
            </div>;
        };
    },
});
