import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IJavascriptQuery, IPublicModelProject } from '@webank/letgo-types';
import EventHandlers from './event-handlers';
import Resource from './resource';

export default defineComponent({
    name: 'CommonGeneral',
    props: {
        isGlobal: Boolean,
        project: Object as PropType<IPublicModelProject>,
        codeItem: Object as PropType<IJavascriptQuery>,
        changeCodeItem: Function as PropType<(content: Partial<IJavascriptQuery>) => void>,
    },
    setup(props, { slots }) {
        return () => {
            return (
                <div>
                    <Resource codeItem={props.codeItem} changeCodeItem={props.changeCodeItem} />
                    {slots.default()}
                    <EventHandlers isGlobal={props.isGlobal} project={props.project} codeItem={props.codeItem} changeCodeItem={props.changeCodeItem} />
                </div>
            );
        };
    },
});
