import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { IJavascriptComputed } from '@webank/letgo-types';
import { CodeEditor } from '@webank/letgo-components';
import './computed-edit.less';
import { debounce } from 'lodash-es';
import { isSyntaxError } from '@webank/letgo-common';

export const ComputedEdit = defineComponent({
    name: 'ComputedEdit',
    props: {
        hints: Object as PropType<Record<string, any>>,
        codeItem: Object as PropType<IJavascriptComputed>,
        changeContent: Function as PropType<(id: string, content: Partial<IJavascriptComputed>) => void>,
    },
    setup(props) {
        const changeFunction = (code: string) => {
            props.changeContent(props.codeItem.id, {
                funcBody: code,
            });
        };

        const onInput = debounce((val: string) => {
            if (!isSyntaxError(val))
                changeFunction(val);
        }, 300);

        return () => {
            return (
                <div class="letgo-comp-logic__computed">
                    <CodeEditor
                        height="100%"
                        class="letgo-comp-logic__computed-editor"
                        hints={props.hints}
                        doc={props.codeItem.funcBody}
                        onInput={onInput}
                        onChange={changeFunction}
                        id={props.codeItem.id}
                        fullscreen={false}
                        lineNumbers
                    />
                    <p style="font-size: 12px">提示: 用已有变量计算出新的变量, 当依赖的变量更新时，新的变量自动更新</p>
                </div>
            );
        };
    },
});
