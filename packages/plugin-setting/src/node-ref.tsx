import type { PropType } from 'vue';
import { defineComponent, nextTick, ref, watch } from 'vue';
import { EditIcon } from '@webank/letgo-components';
import './node-ref.less';

export default defineComponent({
    name: 'NodeRef',
    props: {
        id: String,
        hasCodeId: Function as PropType<(id: string) => boolean>,
        onChange: Function as PropType<(ref: string, preRef: string) => void>,
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
        const hasRepeatIdError = ref(false);

        const currentValue = ref(props.id);
        watch(editing, (val) => {
            if (val)
                currentValue.value = props.id;
        });

        const checkError = (event: Event) => {
            const val = (event.target as HTMLInputElement).value;
            currentValue.value = val;
            if (props.hasCodeId(val) || !/^[a-zA-Z_][a-zA-Z_0-9]*$/.test(val))
                hasRepeatIdError.value = true;

            else
                hasRepeatIdError.value = false;
        };

        const cancelEdit = (event: Event) => {
            const newId = (event.target as HTMLInputElement).value;
            if (!props.hasCodeId(newId) && !hasRepeatIdError.value)
                props.onChange(newId, props.id);

            hasRepeatIdError.value = false;
            editing.value = false;
        };

        return () => {
            return (
                <div class="letgo-plg-setting__ref">
                    <span v-show={!editing.value} class="letgo-plg-setting__ref-content">
                        <span>{props.id}</span>
                        <EditIcon onClick={goEdit} class="letgo-plg-setting__ref-icon" />
                    </span>
                    <input
                        v-show={editing.value}
                        ref={inputRefEl}
                        class={['letgo-plg-setting__ref-input', hasRepeatIdError.value && 'letgo-plg-setting__ref-input--error']}
                        value={currentValue.value}
                        onInput={checkError}
                        onBlur={cancelEdit}
                    />
                </div>
            );
        };
    },
});
