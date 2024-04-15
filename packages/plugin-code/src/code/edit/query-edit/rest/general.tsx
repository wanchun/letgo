import type { DefineComponent, PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IJavascriptQuery, IPublicModelProject, IRestQueryResource } from '@webank/letgo-types';
import CommonGeneral from '../common-general';
import { CustomComponent } from '../../../../common/register';
import ParamsConfig from './params';
import type { ParamsProps } from './params';

export default defineComponent({
    name: 'JSQueryGeneral',
    props: {
        isGlobal: Boolean,
        project: Object as PropType<IPublicModelProject>,
        hints: Object as PropType<Record<string, any>>,
        codeItem: Object as PropType<IRestQueryResource>,
        changeCodeItem: Function as PropType<(content: Partial<IJavascriptQuery>) => void>,
    },
    setup(props) {
        const RestQueryConfig = (CustomComponent.RestQueryConfig || ParamsConfig) as unknown as DefineComponent<ParamsProps>;

        return () => {
            return (
                <CommonGeneral isGlobal={props.isGlobal} project={props.project} codeItem={props.codeItem} changeCodeItem={props.changeCodeItem}>
                    <RestQueryConfig
                        isGlobal={props.isGlobal}
                        project={props.project}
                        hints={props.hints}
                        codeItem={props.codeItem}
                        changeCodeItem={props.changeCodeItem}
                    />
                </CommonGeneral>
            );
        };
    },
});
