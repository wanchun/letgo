import type { IControlComponentAction, IControlQueryAction, IGoToPageAction, IGoToUrlAction, IPublicTypeEventHandler, ISetLocalStorageAction, ISetTemporaryStateAction } from '@webank/letgo-types';
import { EventHandlerAction } from '@webank/letgo-types';
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
                <Label label="Query">
                    <FSelect v-model={data.callId} appendToContainer={false} options={queryOptions.value} />
                </Label>
                <Label label="Method">
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
                    <FSelect appendToContainer={false} onChange={selectComponent} v-model={data.callId} options={componentInstanceOptions.value} />
                </Label>
                <Label label="Method">
                    <FSelect appendToContainer={false} v-model={data.method} options={componentMethods.value} />
                </Label>
            </>;
        };

        const renderGoToURL = (data: IGoToUrlAction) => {
            return <Label label="URL">
                    <FInput v-model={data.url} />
                </Label>;
        };
        const renderGoToPage = (data: IGoToPageAction) => {
            return <Label label="page">
                    <FSelect appendToContainer={false} v-model={data.pageId}>
                        <FOption value="1">TODO 暂未实现</FOption>
                    </FSelect>
                </Label>;
        };

        const stateOptions = computed(() => {
            return props.documentModel.code.temporaryStates.map((item) => {
                return {
                    label: item.id,
                    value: item.id,
                };
            });
        });
        const renderSetTemporaryState = (data: ISetTemporaryStateAction) => {
            return <>
                <Label label="State">
                    <FSelect appendToContainer={false} v-model={data.callId} options={stateOptions.value} />
                </Label>
                <Label label="value">
                    <FInput v-model={data.value} />
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
                    <FInput v-model={data.key} />
                </Label>
                <Label label="value">
                    <FInput v-model={data.value} />
                </Label>
            </>;
        };
        return () => {
            if (props.componentEvent.action === EventHandlerAction.CONTROL_QUERY)
                return renderQuery(props.componentEvent);

            if (props.componentEvent.action === EventHandlerAction.CONTROL_COMPONENT)
                return renderComponentMethod(props.componentEvent);

            if (props.componentEvent.action === EventHandlerAction.GO_TO_URL)
                return renderGoToURL(props.componentEvent);

            if (props.componentEvent.action === EventHandlerAction.GO_TO_PAGE)
                return renderGoToPage(props.componentEvent);

            if (props.componentEvent.action === EventHandlerAction.SET_TEMPORARY_STATE)
                return renderSetTemporaryState(props.componentEvent);

            if (props.componentEvent.action === EventHandlerAction.SET_LOCAL_STORAGE)
                return renderSetLocalStorage(props.componentEvent);
        };
    },
});
