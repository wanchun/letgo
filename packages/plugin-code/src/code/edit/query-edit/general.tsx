import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IJavascriptQuery, IPublicModelDocumentModel } from '@webank/letgo-types';
import { javascript } from '@codemirror/lang-javascript';
import { CodeEditor } from '@webank/letgo-components';
import { formatJsCode } from '@webank/letgo-common';
import CommonGeneral from './common-general';

export default defineComponent({
    name: 'JSQueryGeneral',
    props: {
        documentModel: Object as PropType<IPublicModelDocumentModel>,
        codeItem: Object as PropType<IJavascriptQuery>,
        changeCodeItem: Function as PropType<(content: Partial<IJavascriptQuery>) => void>,
    },
    setup(props) {
        const changeQuery = (doc: string) => {
            props.changeCodeItem({
                query: doc,
            });
        };

        const onBlur = async (val: string) => {
            val = await formatJsCode(val, { tabWidth: 2 });
            changeQuery(val);
        };

        return () => {
            return (
                <CommonGeneral documentModel={props.documentModel} codeItem={props.codeItem} changeCodeItem={props.changeCodeItem}>
                    <CodeEditor
                        documentModel={props.documentModel}
                        extensions={[javascript()]}
                        doc={props.codeItem.query}
                        changeDoc={changeQuery}
                        onBlur={onBlur}
                    />
                </CommonGeneral>
            );
        };
    },
});
