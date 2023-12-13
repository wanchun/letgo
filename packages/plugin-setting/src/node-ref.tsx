import type { PropType } from 'vue';
import { defineComponent, nextTick, ref } from 'vue';
import { EditIcon } from '@webank/letgo-components';
import './node-ref.less';

export default defineComponent({
    name: 'NodeRef',
    props: {
        id: String,
        onChange: Function as PropType<(ref: string, preRef: string) => void>,
    },
    setup(props) {
        const inputRefEl = ref<HTMLElement>();
        const editing = ref(false);
        const hasCodeId = (id: string) => {
            // TODO hasCodeId 重复性检测
            return false;
        };

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
            const newId = (event.target as HTMLInputElement).value;
            if (!hasCodeId(newId)) {
                props.onChange(newId, props.id);
                cancelEdit();
            }
        };
        // TODO 输入重复的 ID 输入框变红
        return () => {
            return <div class="letgo-plg-setting__ref">
                <span v-show={!editing.value} class="letgo-plg-setting__ref-content">
                    <span>{props.id}</span>
                    <EditIcon onClick={goEdit} class="letgo-plg-setting__ref-icon" />
                </span>
                <input v-show={editing.value} ref={inputRefEl} class="letgo-plg-setting__ref-input" value={props.id} onBlur={cancelEdit} onChange={changeId} />
            </div>;
        };
    },
});
