import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IJavascriptQuery, IRestQueryResource } from '@webank/letgo-types';
import type { DocumentModel } from '@webank/letgo-designer';
import CommonGeneral from '../common-general';
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
            return <CommonGeneral documentModel={props.documentModel} codeItem={props.codeItem} changeCodeItem={props.changeCodeItem}>
                <ParamsConfig documentModel={props.documentModel} codeItem={props.codeItem} changeCodeItem={props.changeCodeItem} />
            </CommonGeneral>;
        };
    },
});
