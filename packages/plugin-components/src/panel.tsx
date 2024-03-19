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
import type {
    IPublicTypeAssetsJson,
    IPublicTypeComponentDescription,
    IPublicTypeSnippet,
} from '@webank/letgo-types';
import {
    isComponentDescription,
} from '@webank/letgo-types';
import type { Designer } from '@webank/letgo-designer';
import type { Editor } from '@webank/letgo-editor-core';

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
        const assetsRef: Ref<IPublicTypeAssetsJson> = shallowRef({});

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

                                return (
                                    snippet.title.includes(searchText.value)
                                );
                            }),
                    );
                    if (categoryObj.snippets.length)
                        res[group].push(categoryObj);
                });
            });
            return res;
        });

        const onSearch = (val: string) => {
            searchText.value = val;
        };

        let unwatch: () => void;
        onBeforeMount(() => {
            unwatch = props.editor.onChange('assets', (assets) => {
                assetsRef.value = assets;
            });
        });

        onUnmounted(() => {
            if (unwatch)
                unwatch();
        });

        const designer = props.designer;
        const dragon = designer.dragon;

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
                    data: snippet.schema,
                };
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
                            default: () => groupListRef.value.map((group) => {
                                return (
                                    <FTabPane
                                        name={group}
                                        value={group}
                                        displayDirective="show"
                                    >
                                        <FScrollbar>
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
