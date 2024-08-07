import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IJavascriptFunction } from '@webank/letgo-types';
import { CodeEditor } from '@webank/letgo-components';
import './function-edit.less';

export const FunctionEdit = defineComponent({
    name: 'FunctionEdit',
    props: {
        hints: Object as PropType<Record<string, any>>,
        codeItem: Object as PropType<IJavascriptFunction>,
        changeContent: Function as PropType<(id: string, content: Partial<IJavascriptFunction>) => void>,
    },
    setup(props) {
        const changeFunction = (code: string) => {
            props.changeContent(props.codeItem.id, {
                funcBody: code,
            });
        };

        return () => {
            return (
                <div class="letgo-comp-logic__func">
                    <CodeEditor
                        class="letgo-comp-logic__func-editor"
                        height="100%"
                        hints={props.hints}
                        doc={props.codeItem.funcBody}
                        onChange={changeFunction}
                        id={props.codeItem.id}
                        fullscreen={false}
                        lineNumbers
                    />
                </div>
            );
        };
    },
});
