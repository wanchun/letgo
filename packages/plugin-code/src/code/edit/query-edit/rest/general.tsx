import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IJavascriptQuery, IPublicModelDocumentModel, IRestQueryResource } from '@webank/letgo-types';
import CommonGeneral from '../common-general';
import { CustomComponent } from '../../../../common/register';
import ParamsConfig from './params';

export default defineComponent({
    name: 'JSQueryGeneral',
    props: {
        documentModel: Object as PropType<IPublicModelDocumentModel>,
        codeItem: Object as PropType<IRestQueryResource>,
        changeCodeItem: Function as PropType<(content: Partial<IJavascriptQuery>) => void>,
    },
    setup(props) {
        const RestQueryConfig = CustomComponent.RestQueryConfig || ParamsConfig;
        return () => {
            return (
                <CommonGeneral documentModel={props.documentModel} codeItem={props.codeItem} changeCodeItem={props.changeCodeItem}>
                    <RestQueryConfig documentModel={props.documentModel} codeItem={props.codeItem} changeCodeItem={props.changeCodeItem} />
                </CommonGeneral>
            );
        };
    },
});
