import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IJavascriptQuery, IPublicModelProject } from '@webank/letgo-types';
import { CodeEditor } from '@webank/letgo-components';
import CommonGeneral from './common-general';

export default defineComponent({
    name: 'JSQueryGeneral',
    props: {
        isGlobal: Boolean,
        project: Object as PropType<IPublicModelProject>,
        hints: Object as PropType<Record<string, any>>,
        codeItem: Object as PropType<IJavascriptQuery>,
        changeCodeItem: Function as PropType<(content: Partial<IJavascriptQuery>) => void>,
    },
    setup(props) {
        const changeQuery = (code: string) => {
            props.changeCodeItem({
                query: code,
            });
        };

        return () => {
            return (
                <CommonGeneral isGlobal={props.isGlobal} project={props.project} codeItem={props.codeItem} changeCodeItem={props.changeCodeItem}>
                    <CodeEditor
                        hints={props.hints}
                        doc={props.codeItem.query}
                        onChange={changeQuery}
                    />
                </CommonGeneral>
            );
        };
    },
});
