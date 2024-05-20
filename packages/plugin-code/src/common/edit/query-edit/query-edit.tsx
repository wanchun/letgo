import type { PropType } from 'vue';
import { defineComponent, ref } from 'vue';
import { FScrollbar } from '@fesjs/fes-design';
import { isRestQueryResource } from '@webank/letgo-types';
import type { IJavascriptQuery, IPublicModelProject } from '@webank/letgo-types';
import LeftTabs from './left-tabs';
import General from './general';
import RestGeneral from './rest/general';
import ResponseEdit from './response';
import Advance from './advance';
import './query-edit.less';

export default defineComponent({
    name: 'QueryEditView',
    props: {
        hints: Object as PropType<Record<string, any>>,
        isGlobal: Boolean,
        project: Object as PropType<IPublicModelProject>,
        codeItem: Object as PropType<IJavascriptQuery>,
        changeContent: Function as PropType<(id: string, content: Partial<IJavascriptQuery>) => void>,
    },
    setup(props) {
        const changeCodeItem = (data: Partial<IJavascriptQuery>) => {
            props.changeContent(props.codeItem.id, {
                ...data,
            });
        };

        const currentTab = ref('general');
        const changeTab = (tab: string) => {
            currentTab.value = tab;
        };

        const renderContent = () => {
            if (currentTab.value === 'general') {
                if (isRestQueryResource(props.codeItem))
                    return <RestGeneral isGlobal={props.isGlobal} project={props.project} hints={props.hints} codeItem={props.codeItem} changeCodeItem={changeCodeItem} />;

                return <General isGlobal={props.isGlobal} project={props.project} hints={props.hints} codeItem={props.codeItem} changeCodeItem={changeCodeItem} />;
            }

            else if (currentTab.value === 'response') {
                return <ResponseEdit codeItem={props.codeItem} changeCodeItem={changeCodeItem} />;
            }

            return <Advance hints={props.hints} changeCodeItem={changeCodeItem} codeItem={props.codeItem} />;
        };

        return () => {
            return (
                <>
                    <div class="letgo-plg-code__query-header">
                        <LeftTabs tab={currentTab.value} changeTab={changeTab} />
                    </div>
                    <FScrollbar class="letgo-plg-code__query-content-wrapper" containerClass="letgo-plg-code__query-content">
                        {renderContent()}
                    </FScrollbar>
                </>
            );
        };
    },
});
