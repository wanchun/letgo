import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import CodeEditor from '../../../code-editor';
import type { JavascriptQuery } from '../../../interface';

export default defineComponent({
    props: {
        codeItem: Object as PropType<JavascriptQuery>,
        changeCodeItem: Function as PropType<(content: Partial<JavascriptQuery>) => void>,
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
