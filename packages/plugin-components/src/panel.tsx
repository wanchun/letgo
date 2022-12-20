import {
    defineComponent,
    PropType,
    ref,
    shallowRef,
    Ref,
    computed,
    onBeforeMount,
    onUnmounted,
} from 'vue';
import {
    FInput,
    FButton,
    FGrid,
    FGridItem,
    FTabPane,
    FTabs,
    FScrollbar,
} from '@fesjs/fes-design';
import { SearchOutlined } from '@fesjs/fes-design/icon';
import {
    AssetsJson,
    Snippet,
    isComponentDescription,
} from '@webank/letgo-types';
import { Designer } from '@webank/letgo-designer';
import { Editor } from '@webank/letgo-editor-core';
import {
    categoryBodyCls,
    categoryItemCls,
    categoryItemIconCls,
    categoryTitleCls,
    searchCls,
} from './panel.css';

interface CategoryType {
    category: string;
    snippets: Snippet[];
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
        const assetsRef: Ref<AssetsJson> = shallowRef({});

        const searchText: Ref<string> = ref();

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
                    assetsRef.value.components.forEach((component) => {
                        if (!isComponentDescription(component)) return;
                        if (
                            component.group === group &&
                            component.category === category
                        ) {
                            categoryObj.snippets = categoryObj.snippets.concat(
                                component.snippets
                                    .map((snippet) => {
                                        return {
                                            component,
                                            title: component.title,
                                            screenshot: component.screenshot,
                                            ...snippet,
                                        };
                                    })
                                    .filter((snippet) => {
                                        if (!searchText.value) {
                                            return true;
                                        }
                                        return (
                                            snippet.title.indexOf(
                                                searchText.value,
                                            ) !== -1
                                        );
                                    }),
                            );
                        }
                    });
                    if (categoryObj.snippets.length) {
                        res[group].push(categoryObj);
                    }
                });
            });
            return res;
        });

        const onSearch = (val: string) => {
            searchText.value = val;
        };

        let unwatch: () => void;
        onBeforeMount(() => {
            unwatch = props.editor.onGot('assets', (assets) => {
                assetsRef.value = assets;
            });
        });

        onUnmounted(() => {
            if (unwatch) {
                unwatch();
            }
        });

        const designer = props.designer;
        const dragon = designer.dragon;

        const dragonMap = new Map<Element, () => void>();

        const handleDrag = (el: Element, snippet: Snippet) => {
            if (!dragon) return;
            const lastClear = dragonMap.get(el);
            if (lastClear) {
                lastClear();
            }
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

        const renderSnippet = (snippets: Snippet[]) => {
            return snippets.map((snippet) => {
                const renderIcon = () => {
                    return (
                        snippet.screenshot && (
                            <img
                                class={categoryItemIconCls}
                                src={snippet.screenshot}
                                draggable="false"
                            />
                        )
                    );
                };
                return (
                    <FGridItem span={12}>
                        <FButton
                            class={categoryItemCls}
                            v-slots={{ icon: renderIcon }}
                            ref={(el: any) => {
                                if (!el?.$el) return;
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
                    <>
                        <div class={categoryTitleCls}>{item.category}</div>
                        <FGrid
                            wrap
                            gutter={[10, 10]}
                            class={categoryBodyCls}
                            v-show={item.show}
                        >
                            {renderSnippet(item.snippets)}
                        </FGrid>
                    </>
                );
            });
        };

        return () => {
            return (
                <FScrollbar>
                    <div class={searchCls}>
                        <FInput
                            placeholder="请输入"
                            clearable
                            onInput={onSearch}
                            v-slots={{
                                suffix: () => <SearchOutlined />,
                            }}
                        ></FInput>
                    </div>
                    <FTabs>
                        {groupListRef.value.map((group) => {
                            return (
                                <FTabPane
                                    name={group}
                                    value={group}
                                    displayDirective="show"
                                >
                                    {renderCategory(group)}
                                </FTabPane>
                            );
                        })}
                    </FTabs>
                </FScrollbar>
            );
        };
    },
});
