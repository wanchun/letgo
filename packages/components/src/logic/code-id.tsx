import type { PropType } from 'vue';
import { defineComponent, nextTick, ref, watch } from 'vue';
import { FEllipsis } from '@fesjs/fes-design';
import { useVModel } from '@vueuse/core';
import './code-id.less';

export default defineComponent({
    props: {
        id: String,
        isEditing: Boolean,
        onChange: Function as PropType<(id: string, preId: string) => void>,
        hasCodeId: Function as PropType<(id: string) => boolean>,
    },
    emits: ['update:isEditing'],
    setup(props, { emit }) {
        const editing = useVModel(props, 'isEditing', emit);
        const inputRefEl = ref<HTMLElement>();

        const currentValue = ref();
        watch(editing, (val) => {
            if (val) {
                currentValue.value = props.id;
                nextTick(() => {
                    inputRefEl.value.focus();
                });
            }
        });

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
            return (
                <div class="letgo-comp-code__id">
                    <span v-show={!editing.value} class="letgo-comp-code__id-content">
                        <FEllipsis class="letgo-comp-code__id-text" content={props.id}></FEllipsis>
                    </span>
                    <input
                        v-show={editing.value}
                        ref={inputRefEl}
                        class={['letgo-comp-code__id-input', hasRepeatIdError.value && 'letgo-comp-code__id-input--error']}
                        value={currentValue.value}
                        onInput={checkError}
                        onBlur={cancelEdit}
                        onChange={changeId}
                    />
                </div>
            );
        };
    },
});
