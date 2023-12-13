import type { PropType } from 'vue';
import { computed, defineComponent, ref, watch } from 'vue';
import { FButton } from '@fesjs/fes-design';
import { cloneDeep, isEqual } from 'lodash-es';
import { isRestQueryResource } from '@webank/letgo-types';
import type { IJavascriptQuery } from '@webank/letgo-types';
import type { DocumentModel } from '@webank/letgo-designer';
import LeftTabs from './left-tabs';
import General from './general';
import RestGeneral from './rest/general';
import ResponseEdit from './response';
import Advance from './advance';
import './query-edit.less';

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
        watch(() => props.codeItem, () => {
            tmpCodeItem.value = cloneDeep(props.codeItem);
        }, {
            deep: true,
        });

        const isChange = computed(() => {
            return !isEqual(tmpCodeItem.value, props.codeItem);
        });

        const currentTab = ref('general');
        const changeTab = (tab: string) => {
            currentTab.value = tab;
        };

        const renderContent = () => {
            if (currentTab.value === 'general') {
                if (isRestQueryResource(tmpCodeItem.value))
                    return <RestGeneral documentModel={props.documentModel} codeItem={tmpCodeItem.value} changeCodeItem={changeCodeItem} />;

                return <General documentModel={props.documentModel} codeItem={tmpCodeItem.value} changeCodeItem={changeCodeItem} />;
            }

            else if (currentTab.value === 'response') {
                return <ResponseEdit codeItem={tmpCodeItem.value} changeCodeItem={changeCodeItem} />;
            }

            return <Advance codeItem={tmpCodeItem.value} />;
        };

        return () => {
            return (
                <>
                    <div class="letgo-plg-code__query-header">
                        <LeftTabs tab={currentTab.value} changeTab={changeTab} />
                        <div>
                            <FButton type="primary" size="small" disabled={!isChange.value} onClick={onSave}>保存</FButton>
                        </div>
                    </div>
                    <div class="letgo-plg-code__query-content">
                        {renderContent()}
                    </div>
                </>
            );
        };
    },
});
