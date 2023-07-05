import type { IControlComponentAction, IControlQueryAction, IPublicTypeEventHandler, IRunFunctionAction, ISetLocalStorageAction, ISetTemporaryStateAction } from '@webank/letgo-types';
import { InnerEventHandlerAction } from '@webank/letgo-types';
import type { PropType } from 'vue';
import { computed, defineComponent, ref } from 'vue';

import { FInput, FOption, FSelect } from '@fesjs/fes-design';
import type { DocumentModel } from '@webank/letgo-designer';
import Label from './label';

export default defineComponent({
    name: 'RenderOptions',
    props: {
        documentModel: Object as PropType<DocumentModel>,
        componentEvent: Object as PropType<IPublicTypeEventHandler>,
        onChange: Function as PropType<((content: Record<string, any>) => void)>,
    },
    setup(props) {
        const queryOptions = computed(() => {
            return props.documentModel.code.queries.map((item) => {
                return {
                    label: item.id,
                    value: item.id,
                };
            });
        });
        const renderQuery = (data: IControlQueryAction) => {
            return <>
                <Label label="查询">
                    <FSelect v-model={data.namespace} appendToContainer={false} options={queryOptions.value} />
                </Label>
                <Label label="方法">
                    <FSelect v-model={data.method} appendToContainer={false}>
                        <FOption value="trigger">Trigger</FOption>
                        <FOption value="reset">Reset</FOption>
                        <FOption value="clearCache">Clear Cache</FOption>
                    </FSelect>
                </Label>
            </>;
        };

        const componentInstanceOptions = computed(() => {
            return Object.keys(props.documentModel.state.componentsInstance).map((key) => {
                return {
                    label: key,
                    value: key,
                };
            });
        });
        const componentMethods = ref<{ label: string; value: string }[]>([]);
        const selectComponent = (value: string) => {
            const componentName = props.documentModel.state.componentsInstance[value]._componentName;
            const metadata = props.documentModel.getComponentMeta(componentName).getMetadata();
            componentMethods.value = (metadata.configure?.supports?.methods || []).map((item) => {
                if (typeof item === 'string') {
                    return {
                        label: item,
                        value: item,
                    };
                }
                return {
                    label: item.name,
                    value: item.name,
                };
            });
        };
        // TODO 参数配置
        const renderComponentMethod = (data: IControlComponentAction) => {
            return <>
                <Label label="Component">
                    <FSelect appendToContainer={false} onChange={selectComponent} v-model={data.namespace} options={componentInstanceOptions.value} />
                </Label>
                <Label label="Method">
                    <FSelect appendToContainer={false} v-model={data.method} options={componentMethods.value} />
                </Label>
            </>;
        };

        const stateOptions = computed(() => {
            return props.documentModel.code.temporaryStates.map((item) => {
                return {
                    label: item.id,
                    value: item.id,
                };
            }).concat(props.documentModel.project.code.temporaryStates.map((item) => {
                return {
                    label: item.id,
                    value: `${item.id}.value`,
                };
            }));
        });
        const renderSetTemporaryState = (data: ISetTemporaryStateAction) => {
            return <>
                <Label label="State">
                    <FSelect appendToContainer={false} v-model={data.namespace} options={stateOptions.value} />
                </Label>
                <Label label="value">
                    <FInput v-model={data.params.value} />
                </Label>
            </>;
        };
        const renderSetLocalStorage = (data: ISetLocalStorageAction) => {
            return <>
                <Label label="Method">
                    <FSelect appendToContainer={false} v-model={data.method}>
                        <FOption value="setValue">set Value</FOption>
                        <FOption value="clear">Clear</FOption>
                    </FSelect>
                </Label>
                <Label label="key">
                    <FInput v-model={data.params.key} />
                </Label>
                <Label label="value">
                    <FInput v-model={data.params.value} />
                </Label>
            </>;
        };

        const functionOptions = computed(() => {
            return props.documentModel.code.functions.map((item) => {
                return {
                    label: item.id,
                    value: item.id,
                };
            });
        });
        const renderRunFunction = (data: IRunFunctionAction) => {
            return <Label label="function">
                <FSelect v-model={data.namespace} appendToContainer={false} options={functionOptions.value} />
            </Label>;
        };

        return () => {
            if (props.componentEvent.action === InnerEventHandlerAction.CONTROL_QUERY)
                return renderQuery(props.componentEvent as IControlQueryAction);

            if (props.componentEvent.action === InnerEventHandlerAction.CONTROL_COMPONENT)
                return renderComponentMethod(props.componentEvent as IControlComponentAction);

            if (props.componentEvent.action === InnerEventHandlerAction.SET_TEMPORARY_STATE)
                return renderSetTemporaryState(props.componentEvent as ISetTemporaryStateAction);

            if (props.componentEvent.action === InnerEventHandlerAction.SET_LOCAL_STORAGE)
                return renderSetLocalStorage(props.componentEvent as ISetLocalStorageAction);

            if (props.componentEvent.action === InnerEventHandlerAction.RUN_FUNCTION)
                return renderRunFunction(props.componentEvent as IRunFunctionAction);
        };
    },
});
