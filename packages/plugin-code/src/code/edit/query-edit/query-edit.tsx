import type { PropType } from 'vue';
import { computed, defineComponent, ref, watch } from 'vue';
import { FButton } from '@fesjs/fes-design';
import { cloneDeep, isEqual } from 'lodash-es';
import type { IJavascriptQuery } from '@webank/letgo-types';
import type { DocumentModel } from '@webank/letgo-designer';
import { contentCls, headerCls } from './query-edit.css';
import LeftTabs from './left-tabs';
import General from './general';
import ResponseEdit from './response';
import Advance from './advance';

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

        const currentTab = ref('general');
        const changeTab = (tab: string) => {
            currentTab.value = tab;
        };

        const renderContent = () => {
            if (currentTab.value === 'general')
                return <General documentModel={props.documentModel} codeItem={tmpCodeItem.value} changeCodeItem={changeCodeItem} />;

            else if (currentTab.value === 'response')
                return <ResponseEdit codeItem={tmpCodeItem.value} changeCodeItem={changeCodeItem} />;

            return <Advance codeItem={tmpCodeItem.value} />;
        };

        return () => {
            return <div>
                <div class={headerCls}>
                    <LeftTabs tab={currentTab.value} changeTab={changeTab} />
                    <span>{props.codeItem.id}</span>
                    <div>
                        <FButton type="primary" size="small" disabled={!isChange.value} onClick={onSave}>保存</FButton>
                    </div>
                </div>
                <div class={contentCls}>
                    {renderContent()}
                </div>
            </div>;
        };
    },
});
