import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import type { ILifecycle } from '@webank/letgo-types';
import { CodeEditor } from '@webank/letgo-components';
import { FSelect } from '@fesjs/fes-design';
import { IPublicPageLifecycleList, IPublicProjectLifecycleList } from '@webank/letgo-types';
import ContentItem from '../content-item';
import './lifecycle-hook.less';

export const HookEdit = defineComponent({
    name: 'HookEdit',
    props: {
        hints: Object as PropType<Record<string, any>>,
        codeItem: Object as PropType<ILifecycle>,
        changeContent: Function as PropType<(id: string, content: Partial<ILifecycle>) => void>,
        type: String as PropType<'project' | 'page'>,
    },
    setup(props) {
        const hookList = computed(() => {
            if (props.type === 'project') {
                return IPublicProjectLifecycleList.map((item) => {
                    return {
                        ...item,
                        label: `${item.value} - ${item.label}`,
                    };
                });
            }
            if (props.type === 'page') {
                return IPublicPageLifecycleList.map((item) => {
                    return {
                        ...item,
                        label: `${item.value} - ${item.label}`,
                    };
                });
            }
            return [];
        });

        const changeFuncBody = (value: string, id: string) => {
            props.changeContent(id || props.codeItem.id, {
                funcBody: value,
            });
        };

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
                        class="letgo-comp-logic__hook-editor"
                        height="100%"
                        hints={props.hints}
                        doc={props.codeItem.funcBody}
                        onChange={changeFuncBody}
                        id={props.codeItem.id}
                    />
                </div>
            );
        };
    },
});
