import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IJavascriptQuery } from '@webank/letgo-types';
import type { DocumentModel } from '@webank/letgo-designer';
import EventHandlers from './event-handlers';
import Resource from './resource';

export default defineComponent({
    name: 'CommonGeneral',
    props: {
        documentModel: Object as PropType<DocumentModel>,
        codeItem: Object as PropType<IJavascriptQuery>,
        changeCodeItem: Function as PropType<(content: Partial<IJavascriptQuery>) => void>,
    },
    setup(props, { slots }) {
        return () => {
            return <div>
                <Resource codeItem={props.codeItem} />
                {slots.default()}
                <EventHandlers documentModel={props.documentModel} codeItem={props.codeItem} changeCodeItem={props.changeCodeItem} />
            </div>;
        };
    },
});
