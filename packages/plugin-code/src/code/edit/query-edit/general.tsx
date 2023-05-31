import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IJavascriptQuery } from '@webank/letgo-types';
import CodeEditor from '../../../code-editor';

export default defineComponent({
    props: {
        codeItem: Object as PropType<IJavascriptQuery>,
        changeCodeItem: Function as PropType<(content: Partial<IJavascriptQuery>) => void>,
    },
    setup(props) {
        const changeQuery = (doc: string) => {
            props.changeCodeItem({
                query: doc,
            });
        };
        return () => {
            return <div>
                <CodeEditor doc={props.codeItem.query} changeDoc={changeQuery} />
            </div>;
        };
    },
});
