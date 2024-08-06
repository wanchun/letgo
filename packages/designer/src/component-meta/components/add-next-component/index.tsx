import { FButton, FGrid, FGridItem, FInput, FTooltip } from '@fesjs/fes-design';
import { AddOne } from '@icon-park/vue-next';
import { isComponentDescription } from '@webank/letgo-common';
import { useLastUsed } from '@webank/letgo-components';
import { editor } from '@webank/letgo-editor-core';
import type { IPublicTypeComponentDescription, IPublicTypeSnippet } from '@webank/letgo-types';
import type {
    PropType,
    Ref,
} from 'vue';
import {
    computed,
    defineComponent,
    ref,
} from 'vue';
import { insertChild } from '../../../node';
import type { INode } from '../../../types';
import './index.less';

export default defineComponent({
    name: 'AddNextComponent',
    props: {
        node: {
            type: Object as PropType<INode>,
        },
        isInline: Boolean,
    },
    setup(props) {
        const { node } = props;
        const project = node.document.project;

        const searchText: Ref<string> = ref();

        const snippetsRef = computed(() => {
            let arr: Array<IPublicTypeSnippet & { component: IPublicTypeComponentDescription; priority: number; title: string; screenshot?: string; group?: string; category: string }> = [];
            editor.get('assets').components.forEach((component: IPublicTypeComponentDescription) => {
                if (!isComponentDescription(component))
                    return;
                arr = arr.concat((component.snippets ?? []).map((snippet: IPublicTypeSnippet) => {
                    return {
                        component,
                        title: component.title,
                        screenshot: component.screenshot,
                        group: component.group,
                        category: component.category,
                        priority: component.priority ?? 0,
                        ...snippet,
                    };
                }));
            });
            return arr.sort((a, b) => {
                return a.priority - b.priority;
            }).filter((snippet) => {
                if (!searchText.value)
                    return true;
                const regex = RegExp(searchText.value, 'i');
                return regex.test(snippet.title + snippet.component.componentName + snippet.keywords);
            });
        });

        const { addLastUsed, lastUsedSnippets } = useLastUsed(snippetsRef, null, project);

        // 下一个推荐的组件
        const nextSnippets = computed(() => {
            if (searchText.value)
                return snippetsRef.value;

            const limitNum = 10; // 最多推荐数量
            // 获取相同分组组件
            const { group, category } = node.componentMeta.getMetadata();
            const snippets = snippetsRef.value.filter(item => item.group === group && item.category === category);
            if (snippets.length >= limitNum)
                return snippets;

            // 用最近常用的组件补充
            let index = 0;
            while (limitNum - snippets.length > 0 && index < lastUsedSnippets.value.length) {
                const snippet = lastUsedSnippets.value[index];
                if (snippet.group !== group || snippet.category !== category)
                    snippets.push(snippet);

                index++;
            }
            return snippets;
        });

        const addNode = (snippet: IPublicTypeSnippet) => {
            const parent = props.node?.parent;
            if (!parent)
                return;
            addLastUsed(snippet);
            const index = node.index + 1;
            const newNode = insertChild(parent, snippet.schema, index);
            newNode.document.selection.select(newNode.id);
            const npm = newNode?.componentMeta?.npm;
            const selected
                = [npm?.package, npm?.exportName]
                    .filter(item => !!item)
                    .join('-')
                    || newNode?.componentMeta?.componentName
                    || '';
            editor?.emit('designer.border.action', {
                name: 'select',
                selected,
            });
        };

        const renderSnippet = (snippets: IPublicTypeSnippet[]) => {
            return snippets.map((snippet) => {
                const renderIcon = () => {
                    return (
                        snippet.screenshot && (
                            <img
                                class="add-next-components-popover__icon"
                                src={snippet.screenshot}
                                draggable="false"
                            />
                        )
                    );
                };
                return (
                    <FGridItem span={12}>
                        <FButton class="add-next-components-popover__item" v-slots={{ icon: renderIcon }} onClick={() => addNode(snippet)}>
                            {snippet.title}
                        </FButton>
                    </FGridItem>
                );
            });
        };

        const contentSlot = () => {
            return (
                <div class="add-next-components-popover">
                    <FInput v-model={searchText.value} placeholder="搜索组件" style="margin-bottom: 12px"></FInput>
                    <FGrid wrap gutter={[10, 10]}>
                        {renderSnippet(nextSnippets.value)}
                    </FGrid>
                </div>
            );
        };

        return () => {
            return (
                <div class="letgo-designer-sim__border-action" title="向前添加一个组件">
                    <FTooltip mode="popover" v-slots={{ content: contentSlot }}>
                        <AddOne size="14"></AddOne>
                    </FTooltip>
                </div>
            );
        };
    },
});
