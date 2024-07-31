import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import type { ILifecycle } from '@webank/letgo-types';
import { CodeEditor, useCodeSave } from '@webank/letgo-components';
import { PageLifecycleList } from '@webank/letgo-common';
import { FSelect } from '@fesjs/fes-design';
import ContentItem from '../content-item';
import './lifecycle-hook.less';

export const HookEdit = defineComponent({
    name: 'HookEdit',
    props: {
        hints: Object as PropType<Record<string, any>>,
        codeItem: Object as PropType<ILifecycle>,
        changeContent: Function as PropType<(id: string, content: Partial<ILifecycle>) => void>,
        type: String as PropType<'page'>,
    },
    setup(props) {
        const hookList = computed(() => {
            if (props.type === 'page') {
                return PageLifecycleList.map((item) => {
                    return {
                        ...item,
                        label: `${item.value} - ${item.label}`,
                    };
                });
            }
            return [];
        });

        const { codeEditorRef, onBlur } = useCodeSave({
            code: computed(() => props.codeItem.funcBody),
            save(code) {
                props.changeContent(props.codeItem.id, {
                    funcBody: code,
                });
            },
        });

        const changeHookName = (value: string) => {
            props.changeContent(props.codeItem.id, {
                hookName: value,
            });
        };

        return () => {
            return (
                <div class="letgo-comp-logic__hook">
                    <ContentItem label="触发时机：">
                        <FSelect modelValue={props.codeItem.hookName} options={hookList.value} onChange={changeHookName} />
                    </ContentItem>
                    <CodeEditor
                        ref={codeEditorRef}
                        class="letgo-comp-logic__hook-editor"
                        height="100%"
                        hints={props.hints}
                        doc={props.codeItem.funcBody}
                        onBlur={onBlur}
                        id={props.codeItem.id}
                        fullscreen={false}
                        lineNumbers
                    />
                </div>
            );
        };
    },
});
