import type { PropType } from 'vue';
import { computed, defineComponent, ref, watch } from 'vue';
import { FButton } from '@fesjs/fes-design';
import { cloneDeep, isEqual } from 'lodash-es';
import type { IJavascriptQuery } from '@webank/letgo-types';
import type { DocumentModel } from '@webank/letgo-designer';
import { contentCls, headerCls } from './query-edit.css';
import LeftActions from './left-actions';
import General from './general';

export default defineComponent({
    props: {
        documentModel: Object as PropType<DocumentModel>,
        codeItem: Object as PropType<IJavascriptQuery>,
        changeContent: Function as PropType<(id: string, content: Partial<IJavascriptQuery>) => void>,
    },
    setup(props) {
        const tmpCodeItem = ref(cloneDeep(props.codeItem));
        const onSave = () => {
            props.changeContent(props.codeItem.id, {
                ...tmpCodeItem.value,
            });
        };
        const changeCodeItem = (data: Partial<IJavascriptQuery>) => {
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
                    <General documentModel={props.documentModel} codeItem={tmpCodeItem.value} changeCodeItem={changeCodeItem} />
                </div>
            </div>;
        };
    },
});
