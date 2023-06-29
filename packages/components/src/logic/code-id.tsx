import type { PropType } from 'vue';
import { defineComponent, nextTick, ref } from 'vue';
import { EditIcon } from '../icons';
import { codeIdCls, editIconCls, idContentCls, inputCls, inputErrorCls } from './code-id.css';

export default defineComponent({
    props: {
        id: String,
        onChange: Function as PropType<(id: string, preId: string) => void>,
        hasCodeId: Function as PropType<(id: string) => boolean>,
    },
    setup(props) {
        const inputRefEl = ref<HTMLElement>();
        const editing = ref(false);

        const currentValue = ref();
        const goEdit = () => {
            editing.value = true;
            currentValue.value = props.id;
            nextTick(() => {
                inputRefEl.value.focus();
            });
        };

        const hasRepeatIdError = ref(false);
        const cancelEdit = () => {
            editing.value = false;
            hasRepeatIdError.value = false;
        };
        const checkError = (event: Event) => {
            const val = (event.target as HTMLInputElement).value;
            currentValue.value = val;
            if (props.hasCodeId(val) || !/^[a-zA-Z_][a-zA-Z_0-9]*$/.test(val))
                hasRepeatIdError.value = true;

            else
                hasRepeatIdError.value = false;
        };

        const changeId = (event: Event) => {
            const newId = (event.target as HTMLInputElement).value;
            if (!props.hasCodeId(newId)) {
                props.onChange(newId, props.id);
                cancelEdit();
            }
        };

        return () => {
            return <div class={codeIdCls}>
                <span v-show={!editing.value} class={idContentCls}>
                    <span>{props.id}</span>
                    <EditIcon onClick={goEdit} class={editIconCls} />
                </span>
                <input
                    v-show={editing.value}
                    ref={inputRefEl}
                    class={[inputCls, hasRepeatIdError.value && inputErrorCls]}
                    value={currentValue.value}
                    onInput={checkError}
                    onBlur={cancelEdit}
                    onChange={changeId}
                />
            </div>;
        };
    },
});
