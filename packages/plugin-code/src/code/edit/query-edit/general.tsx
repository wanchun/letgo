import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IJavascriptQuery } from '@webank/letgo-types';
import type { DocumentModel } from '@webank/letgo-designer';
import { CodeEditor } from '@webank/letgo-components';
import CommonGeneral from './common-general';

export default defineComponent({
    name: 'JSQueryGeneral',
    props: {
        documentModel: Object as PropType<DocumentModel>,
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
            return <CommonGeneral documentModel={props.documentModel} codeItem={props.codeItem} changeCodeItem={props.changeCodeItem}>
                        <CodeEditor documentModel={props.documentModel} doc={props.codeItem.query} changeDoc={changeQuery} />
                </CommonGeneral>;
        };
    },
});
