import type { IControlComponentAction, IControlQueryAction, IEventHandler, IPublicModelProject, IRunFunctionAction, ISetLocalStorageAction, ISetTemporaryStateAction } from '@webank/letgo-types';
import { IEnumEventHandlerAction, IEnumRunScript, isRunFunctionEventHandler } from '@webank/letgo-types';
import { CodeBrackets } from '@icon-park/vue-next';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';

import { FInput, FOption, FSelect, FTooltip } from '@fesjs/fes-design';
import { DeleteOutlined, PlusCircleOutlined } from '@fesjs/fes-design/icon';
import { CodeEditor } from '../../code-editor';
import { useCodeHints } from '../../use/use-code-hints';
import Label from './label';
import './render-options.less';
import { useStateOptions } from './use-state-options';

export default defineComponent({
    name: 'RenderOptions',
    props: {
        project: Object as PropType<IPublicModelProject>,
        isGlobal: Boolean,
        componentEvent: Object as PropType<IEventHandler>,
    },
    setup(props) {
        const {
            queryOptions,
            variableOptions,
            functionOptions,
            componentInstanceOptions,
            componentMethods,
        } = useStateOptions(props);
        const hints = useCodeHints(props);

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

        const changeVariablePath = (data: ISetTemporaryStateAction) => {
            if (data.params[1])
                data.method = 'setIn';

            else
                data.method = 'setValue';
        };
        const renderVariables = (data: ISetTemporaryStateAction) => {
            return (
                <>
                    <Label label="变量">
                        <FSelect appendToContainer={false} v-model={data.namespace} filterable options={variableOptions.value} />
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
                        hints={hints.value}
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
                return renderVariables(props.componentEvent as ISetTemporaryStateAction);

            if (props.componentEvent.action === IEnumEventHandlerAction.SET_LOCAL_STORAGE)
                return renderSetLocalStorage(props.componentEvent as ISetLocalStorageAction);

            if (isRunFunctionEventHandler(props.componentEvent))
                return renderFunction(props.componentEvent);
        };
    },
});
