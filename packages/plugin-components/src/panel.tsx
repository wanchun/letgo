import {
    FButton,
    FGrid,
    FGridItem,
    FInput,
    FScrollbar,
    FTabPane,
    FTabs,
} from '@fesjs/fes-design';
import { SearchOutlined } from '@fesjs/fes-design/icon';
import {
    isComponentDescription,
} from '@webank/letgo-common';
import type { Designer } from '@webank/letgo-designer';
import type { Editor } from '@webank/letgo-editor-core';
import type {
    IPublicModelProject,
    IPublicTypeAssetsJson,
    IPublicTypeComponentDescription,
    IPublicTypeSnippet,
} from '@webank/letgo-types';
import type {
    PropType,
    Ref,
} from 'vue';
import {
    computed,
    defineComponent,
    onBeforeMount,
    onUnmounted,
    ref,
    shallowRef,
} from 'vue';

import { CloseOne } from '@icon-park/vue-next';
import { useLastUsed } from '@webank/letgo-components';
import './panel.less';

interface CategoryType {
    category: string;
    snippets: IPublicTypeSnippet[];
    show: Ref<boolean>;
}

export default defineComponent({
    props: {
        editor: {
            type: Object as PropType<Editor>,
        },
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup(props) {
        const designer = props.designer;
        const editor = props.editor;
        const dragon = designer.dragon;

        const assetsRef: Ref<IPublicTypeAssetsJson> = shallowRef(editor.get('assets') || {});

        const searchText: Ref<string> = ref();

        const snippetsRef = computed(() => {
            let arr: Array<IPublicTypeSnippet & { component: IPublicTypeComponentDescription; priority: number; title: string; screenshot?: string; group?: string; category: string }> = [];
            assetsRef.value.components.forEach((component) => {
                if (!isComponentDescription(component))
                    return;
                arr = arr.concat((component.snippets ?? []).map((snippet) => {
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
            });
        });

        const groupListRef: Ref<string[]> = computed(() => {
            return assetsRef.value.sort?.groupList ?? [];
        });

        const categoryListRef: Ref<{
            [propName: string]: Array<CategoryType>;
        }> = computed(() => {
            const categoryList = assetsRef.value.sort?.categoryList ?? [];
            const res: { [propName: string]: Array<CategoryType> } = {};
            groupListRef.value.forEach((group) => {
                res[group] = [];
                categoryList.forEach((category) => {
                    const categoryObj: CategoryType = {
                        category,
                        snippets: [],
                        show: ref(true),
                    };
                    categoryObj.snippets = categoryObj.snippets.concat(
                        snippetsRef.value
                            .filter((snippet) => {
                                return snippet.group === group && snippet.category === category;
                            })
                            .filter((snippet) => {
                                if (!searchText.value)
                                    return true;
                                const regex = RegExp(searchText.value, 'i');
                                return regex.test(snippet.title + snippet.component.componentName + snippet.keywords);
                            }),
                    );
                    if (categoryObj.snippets.length)
                        res[group].push(categoryObj);
                });
            });
            return res;
        });

        // 最近使用
        const { lastUsedSnippets, addLastUsed, clearLastUsed } = useLastUsed(snippetsRef, 10, props.designer.project as unknown as IPublicModelProject);

        const onSearch = (val: string) => {
            searchText.value = val;
        };

        const unwatch: Array<() => void> = [];
        onBeforeMount(() => {
            unwatch.push(editor.onChange('assets', (assets) => {
                assetsRef.value = assets;
            }));
        });

        onUnmounted(() => {
            unwatch.forEach(fn => fn());
        });

        const dragonMap = new Map<Element, () => void>();

        const handleDrag = (el: Element, snippet: IPublicTypeSnippet) => {
            if (!dragon)
                return;
            const lastClear = dragonMap.get(el);
            if (lastClear)
                lastClear();

            const clear = dragon.from(el, () => {
                const dragTarget = {
                    type: 'nodeData',
                    data: {
                        title: snippet.title,
                        ...snippet.schema,
                    },
                };
                addLastUsed(snippet);
                return dragTarget;
            });
            dragonMap.set(el, clear);
        };

        onUnmounted(() => {
            dragonMap.forEach((clear) => {
                clear();
            });
        });

        const renderSnippet = (snippets: IPublicTypeSnippet[]) => {
            return snippets.map((snippet) => {
                const renderIcon = () => {
                    return (
                        snippet.screenshot && (
                            <img
                                class="letgo-components__icon"
                                src={snippet.screenshot}
                                draggable="false"
                            />
                        )
                    );
                };
                return (
                    <FGridItem span={12}>
                        <FButton
                            class="letgo-components__item"
                            v-slots={{ icon: renderIcon }}
                            ref={(el: any) => {
                                if (!el?.$el)
                                    return;
                                handleDrag(el.$el as Element, snippet);
                            }}
                        >
                            {snippet.title}
                        </FButton>
                    </FGridItem>
                );
            });
        };

        const renderCategory = (group: string) => {
            return categoryListRef.value[group].map((item) => {
                return (
                    <div class="letgo-components__category">
                        <div class="letgo-components__title">{item.category}</div>
                        <FGrid
                            wrap
                            gutter={[10, 10]}
                            class="letgo-components__body"
                            v-show={item.show}
                        >
                            {renderSnippet(item.snippets)}
                        </FGrid>
                    </div>
                );
            });
        };

        const renderLastUsedCategory = (index: number) => {
            if (!lastUsedSnippets.value?.length || index !== 0)
                return;
            return (
                <div class="letgo-components__category">
                    <div class="letgo-components__title" style="display: flex; align-items: center;">
                        <div>最近常用</div>
                        <FButton type="link" size="small" onClick={clearLastUsed}>
                            <CloseOne theme="outline" size="16" />
                        </FButton>
                    </div>
                    <FGrid
                        wrap
                        gutter={[10, 10]}
                        class="letgo-components__body"
                        v-show={index === 0}
                    >
                        {renderSnippet(lastUsedSnippets.value)}
                    </FGrid>
                </div>
            );
        };

        return () => {
            return (
                <div class="letgo-components">
                    <div class="letgo-components__search">
                        <FInput
                            placeholder="请输入"
                            clearable
                            onInput={onSearch}
                            v-slots={{
                                suffix: () => <SearchOutlined />,
                            }}
                        >
                        </FInput>
                    </div>
                    <FTabs class="letgo-components__tabs">
                        {{
                            default: () => groupListRef.value.map((group, index) => {
                                return (
                                    <FTabPane
                                        name={group}
                                        value={group}
                                        displayDirective="show"
                                    >
                                        <FScrollbar>
                                            {renderLastUsedCategory(index)}
                                            {renderCategory(group)}
                                        </FScrollbar>
                                    </FTabPane>
                                );
                            }),
                        }}
                    </FTabs>
                </div>
            );
        };
    },
});
