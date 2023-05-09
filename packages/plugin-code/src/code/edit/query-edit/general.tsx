import { defineComponent } from 'vue';
import CodeEditor from '../../../code-editor';

export default defineComponent({
    setup() {
        return () => {
            return <CodeEditor />;
        };
    },
});
