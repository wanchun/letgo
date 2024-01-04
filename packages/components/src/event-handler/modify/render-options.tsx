import type { IControlComponentAction, IControlQueryAction, IEventHandler, IPublicModelDocumentModel, IRunFunctionAction, ISetLocalStorageAction, ISetTemporaryStateAction } from '@webank/letgo-types';
import { IEnumEventHandlerAction } from '@webank/letgo-types';
import type { PropType } from 'vue';
import { computed, defineComponent, ref } from 'vue';

import { FInput, FOption, FSelect } from '@fesjs/fes-design';
import { DeleteOutlined, PlusCircleOutlined } from '@fesjs/fes-design/icon';
import Label from './label';
import './render-options.less';

export default defineComponent({
    name: 'RenderOptions',
    props: {
        documentModel: Object as PropType<IPublicModelDocumentModel>,
        componentEvent: Object as PropType<IEventHandler>,
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
            return (
                <>
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
                </>
            );
        };

        const componentInstanceOptions = computed(() => {
            return Object.keys(props.documentModel.state.componentsInstance).map((key) => {
                return {
                    label: key,
                    value: key,
                };
            });
        });
        const componentMethods = ref<{ label: string, value: string }[]>([]);
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
            return (
                <>
                    <Label label="Component">
                        <FSelect appendToContainer={false} onChange={selectComponent} v-model={data.namespace} options={componentInstanceOptions.value} />
                    </Label>
                    <Label label="Method">
                        <FSelect appendToContainer={false} v-model={data.method} options={componentMethods.value} />
                    </Label>
                </>
            );
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
        const changeVariablePath = (data: ISetTemporaryStateAction) => {
            data.method = 'setIn';
        };
        const renderSetTemporaryState = (data: ISetTemporaryStateAction) => {
            return (
                <>
                    <Label label="变量">
                        <FSelect appendToContainer={false} v-model={data.namespace} options={stateOptions.value} />
                    </Label>
                    <Label label="值">
                        <FInput v-model={data.params[0]} />
                    </Label>
                    <Label label="值路径">
                        <FInput v-model={data.params[1]} onChange={() => changeVariablePath(data)} placeholder="值路径，不填默认覆盖整个值" />
                    </Label>
                </>
            );
        };
        const renderSetLocalStorage = (data: ISetLocalStorageAction) => {
            return (
                <>
                    <Label label="方法">
                        <FSelect appendToContainer={false} v-model={data.method}>
                            <FOption value="setValue">set Value</FOption>
                            <FOption value="clear">Clear</FOption>
                        </FSelect>
                    </Label>
                    <Label label="键">
                        <FInput v-model={data.params[0]} />
                    </Label>
                    <Label label="值">
                        <FInput v-model={data.params[1]} />
                    </Label>
                </>
            );
        };

        const functionOptions = computed(() => {
            return props.documentModel.code.functions.map((item) => {
                return {
                    label: item.id,
                    value: item.id,
                };
            });
        });

        const addFunctionParam = (data: IRunFunctionAction) => {
            data.params.push('');
        };
        const deleteFunctionParam = (data: IRunFunctionAction, index: number) => {
            data.params.splice(index, 1);
        };
        const renderRunFunction = (data: IRunFunctionAction) => {
            return (
                <>
                    <Label label="函数名">
                        <FSelect v-model={data.namespace} appendToContainer={false} options={functionOptions.value} />
                    </Label>
                    <Label label="参数">
                        <div class="letgo-comp-event__params">
                            <span>
                                <FInput v-model={data.params[0]} placeholder="参数1" />
                                <PlusCircleOutlined class="letgo-comp-event__params-icon" onClick={() => addFunctionParam(data)} />
                            </span>
                            {data.params.slice(1).map((_, index) => {
                                return (
                                    <span>
                                        <FInput v-model={data.params[index + 1]} placeholder={`参数${index + 2}`} />
                                        <PlusCircleOutlined class="letgo-comp-event__params-icon" onClick={() => addFunctionParam(data)} />
                                        <DeleteOutlined class="letgo-comp-event__params-icon" onClick={() => deleteFunctionParam(data, index + 1)} />
                                    </span>
                                );
                            })}
                        </div>
                    </Label>
                </>
            );
        };

        return () => {
            if (props.componentEvent.action === IEnumEventHandlerAction.CONTROL_QUERY)
                return renderQuery(props.componentEvent as IControlQueryAction);

            if (props.componentEvent.action === IEnumEventHandlerAction.CONTROL_COMPONENT)
                return renderComponentMethod(props.componentEvent as IControlComponentAction);

            if (props.componentEvent.action === IEnumEventHandlerAction.SET_TEMPORARY_STATE)
                return renderSetTemporaryState(props.componentEvent as ISetTemporaryStateAction);

            if (props.componentEvent.action === IEnumEventHandlerAction.SET_LOCAL_STORAGE)
                return renderSetLocalStorage(props.componentEvent as ISetLocalStorageAction);

            if (props.componentEvent.action === IEnumEventHandlerAction.RUN_FUNCTION)
                return renderRunFunction(props.componentEvent as IRunFunctionAction);
        };
    },
});
