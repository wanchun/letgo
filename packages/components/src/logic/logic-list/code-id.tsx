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
        isInValidateCodeId: Function as PropType<(id: string) => boolean>,
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
        }, {
            immediate: true,
        });

        const hasRepeatIdError = ref(false);

        const checkError = (event: Event) => {
            const val = (event.target as HTMLInputElement).value;
            currentValue.value = val;
            if (val !== props.id && props.isInValidateCodeId(val))
                hasRepeatIdError.value = true;

            else
                hasRepeatIdError.value = false;
        };

        const cancelEdit = (event: Event) => {
            const newId = (event.target as HTMLInputElement).value;

            if (!props.isInValidateCodeId(newId) && !hasRepeatIdError.value)
                props.onChange(newId, props.id);

            editing.value = false;
            hasRepeatIdError.value = false;
        };

        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                inputRefEl.value.blur();
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
                        onKeydown={handleKeydown}
                    />
                </div>
            );
        };
    },
});
