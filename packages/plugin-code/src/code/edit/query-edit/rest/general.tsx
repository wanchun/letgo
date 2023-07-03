import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IJavascriptQuery, IRestQueryResource } from '@webank/letgo-types';
import type { DocumentModel } from '@webank/letgo-designer';
import EventHandlers from '../event-handlers';
import ParamsConfig from './params';

export default defineComponent({
    name: 'JSQueryGeneral',
    props: {
        documentModel: Object as PropType<DocumentModel>,
        codeItem: Object as PropType<IRestQueryResource>,
        changeCodeItem: Function as PropType<(content: Partial<IJavascriptQuery>) => void>,
    },
    setup(props) {
        return () => {
            return <div>
                <ParamsConfig documentModel={props.documentModel} codeItem={props.codeItem} changeCodeItem={props.changeCodeItem} />
                <EventHandlers documentModel={props.documentModel} codeItem={props.codeItem} changeCodeItem={props.changeCodeItem} />
            </div>;
        };
    },
});
