import type { IControlComponentAction, IControlQueryAction, IEventHandler, IPublicModelDocumentModel, IRunFunctionAction, ISetLocalStorageAction, ISetTemporaryStateAction } from '@webank/letgo-types';
import { IEnumEventHandlerAction, IEnumRunScript, isRunFunctionEventHandler } from '@webank/letgo-types';
import { CodeBrackets } from '@icon-park/vue-next';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';

import { FInput, FOption, FSelect, FTooltip } from '@fesjs/fes-design';
import { DeleteOutlined, PlusCircleOutlined } from '@fesjs/fes-design/icon';
import { isEmpty, isFunction, isPlainObject } from 'lodash-es';
import { CodeEditor } from '../../code-editor';
import Label from './label';
import './render-options.less';

export default defineComponent({
    name: 'RenderOptions',
    props: {
        documentModel: Object as PropType<IPublicModelDocumentModel>,
        componentEvent: Object as PropType<IEventHandler>,
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

        const selectQuery = (data: IControlQueryAction) => {
            if (!data.method)
                data.method = 'trigger';
        };
        const renderQuery = (data: IControlQueryAction) => {
            return (
                <>
                    <Label label="查询">
                        <FSelect v-model={data.namespace} onChange={() => selectQuery(data)} filterable appendToContainer={false} options={queryOptions.value} />
                    </Label>
                    <Label label="方法">
                        <FSelect v-model={data.method} appendToContainer={false}>
                            <FOption value="trigger">执行</FOption>
                            <FOption value="reset">重置</FOption>
                            <FOption value="clearCache">清理缓存</FOption>
                        </FSelect>
                    </Label>
                </>
            );
        };

        const componentInstanceOptions = computed(() => {
            const instances = props.documentModel.state.componentsInstance;
            return Object.keys(instances).filter(key => !Array.isArray(instances[key]) && !isEmpty(instances[key])).map((key) => {
                return {
                    label: key,
                    value: key,
                };
            });
        });

        const componentMethods = computed<{ label: string; value: string }[]>(() => {
            if (props.componentEvent.action === IEnumEventHandlerAction.CONTROL_COMPONENT && props.componentEvent.namespace) {
                const componentName = props.documentModel.state.componentsInstance[props.componentEvent.namespace].__componentName;
                const metadata = props.documentModel.getComponentMeta(componentName).getMetadata();
                return (metadata.configure?.supports?.methods || []).map((item) => {
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
            }
            return [];
        });

        const renderComponentMethod = (data: IControlComponentAction) => {
            return (
                <>
                    <Label label="组件">
                        <FSelect appendToContainer={false} v-model={data.namespace} filterable options={componentInstanceOptions.value} />
                    </Label>
                    <Label label="方法">
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
            if (data.params[1])
                data.method = 'setIn';

            else
                data.method = 'setValue';
        };
        const renderSetTemporaryState = (data: ISetTemporaryStateAction) => {
            return (
                <>
                    <Label label="变量">
                        <FSelect appendToContainer={false} v-model={data.namespace} filterable options={stateOptions.value} />
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
                            <FOption value="setValue">setValue</FOption>
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

        function pickFuncFromObj(data: Record<string, any>, parent: string[] = []) {
            let funcs: string[] = [];
            for (const key of Object.keys(data)) {
                if (key.startsWith('__'))
                    continue;

                if (isFunction(data[key]))
                    funcs.push([...parent, key].join('.'));

                if (isPlainObject(data[key]) && parent.length < 2)
                    funcs = funcs.concat(pickFuncFromObj(data[key], parent.concat(key)));
            }
            return funcs;
        }
        const contextFuncs = computed(() => {
            const extraGlobalState = props.documentModel.project.extraGlobalState;
            const utilsFunc = pickFuncFromObj(extraGlobalState.utils, ['utils']);
            const contextFuncs = pickFuncFromObj(extraGlobalState.letgoContext, ['letgoContext']);

            return utilsFunc.concat(contextFuncs).map((item) => {
                return {
                    label: item,
                    value: item,
                };
            });
        });
        const globalFunction = computed(() => {
            return props.documentModel.project.code.functions.map((item) => {
                return {
                    label: item.id,
                    value: item.id,
                };
            });
        });
        const functionOptions = computed(() => {
            return props.documentModel.code.functions.map((item) => {
                return {
                    label: item.id,
                    value: item.id,
                };
            }).concat(globalFunction.value).concat(contextFuncs.value);
        });

        const addFunctionParam = (data: IRunFunctionAction) => {
            data.params.push('');
        };
        const deleteFunctionParam = (data: IRunFunctionAction, index: number) => {
            data.params.splice(index, 1);
        };

        const renderRunFunction = (data: IRunFunctionAction) => {
            if (data.type === IEnumRunScript.PLAIN) {
                return (
                    <CodeEditor
                        height="128px"
                        placeholder="// 输入代码，可输入函数体"
                        documentModel={props.documentModel}
                        doc={data.funcBody}
                        onChange={(doc) => {
                            data.funcBody = doc;
                        }}
                        id={data.id}
                    />
                );
            }
            return (
                <>
                    <Label label="函数名">
                        <FSelect v-model={data.namespace} appendToContainer={false} filterable options={functionOptions.value} />
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

        function renderSwitchAction(data: IRunFunctionAction) {
            const onClick = () => {
                if (data.type === IEnumRunScript.PLAIN)
                    data.type = IEnumRunScript.BIND;
                else
                    data.type = IEnumRunScript.PLAIN;
            };
            return (
                <FTooltip content={data.type === IEnumRunScript.PLAIN ? '绑定函数' : '输入脚本'}>
                    <CodeBrackets
                        onClick={onClick}
                        class={['letgo-comp-event-mixed__icon', data.type === IEnumRunScript.PLAIN && 'letgo-comp-event-mixed__icon--active']}
                        theme="outline"
                        size="14"
                    />
                </FTooltip>
            );
        }

        const renderFunction = (data: IRunFunctionAction) => {
            return (
                <div class="letgo-comp-event-mixed">
                    <div class="letgo-comp-event-mixed__content">
                        {renderRunFunction(data)}
                    </div>
                    <div class="letgo-comp-event-mixed__actions">{renderSwitchAction(data)}</div>
                </div>
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

            if (isRunFunctionEventHandler(props.componentEvent))
                return renderFunction(props.componentEvent);
        };
    },
});
