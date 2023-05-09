import type { PropType } from 'vue';
import { computed, defineComponent, ref, watch } from 'vue';
import { FButton } from '@fesjs/fes-design';
import { cloneDeep, isEqual } from 'lodash-es';
import type { JavascriptQuery } from '../../../interface';
import { contentCls, headerCls } from './query-edit.css';
import LeftActions from './left-actions';
import General from './general';

export default defineComponent({
    props: {
        codeItem: Object as PropType<JavascriptQuery>,
        changeContent: Function as PropType<(id: string, content: Partial<JavascriptQuery>) => void>,
    },
    setup(props) {
        const tmpCodeItem = ref(cloneDeep(props.codeItem));
        const onSave = () => {
            props.changeContent(props.codeItem.id, {
                ...tmpCodeItem.value,
            });
        };
        const changeCodeItem = (data: Partial<JavascriptQuery>) => {
            Object.assign(tmpCodeItem.value, data);
        };
        watch(props.codeItem, () => {
            tmpCodeItem.value = cloneDeep(props.codeItem);
        });

        const isChange = computed(() => {
            return !isEqual(tmpCodeItem.value, props.codeItem);
        });

        return () => {
            return <div>
                <div class={headerCls}>
                    <LeftActions />
                    <span>{props.codeItem.id}</span>
                    <div>
                        <FButton type="primary" size="small" disabled={!isChange.value} onClick={onSave}>保存</FButton>
                    </div>
                </div>
                <div class={contentCls}>
                    <General codeItem={props.codeItem} changeCodeItem={changeCodeItem} />
                </div>
            </div>;
        };
    },
});
