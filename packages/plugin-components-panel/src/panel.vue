<template>
    <div class="search">
        <FInput placeholder="请输入" clearable @input="onSearch">
            <template #suffix>
                <SearchOutlined />
            </template>
        </FInput>
    </div>
    <FTabs>
        <FTabPane
            v-for="group in groupListRef"
            :key="group"
            :name="group"
            :value="group"
        >
            <div
                v-for="(item, index) in categoryListRef[group]"
                :key="index"
                class="category-wrapper"
            >
                <div class="category-title">
                    {{ item.category }}
                    <span @click="toggle(item)">
                        <UpOutlined v-show="item.show" />
                        <DownOutlined v-show="!item.show" />
                    </span>
                </div>
                <div class="category-body" v-show="item.show">
                    <div
                        v-for="(snippet, index) in item.snippets"
                        :key="index"
                        class="category-body-item"
                        draggable="true"
                        @dragstart="handleDragstart($event, snippet)"
                    >
                        <div class="category-body-item-icon">
                            <img
                                :src="snippet.screenshot"
                                draggable="false"
                                v-if="snippet.screenshot"
                            />
                        </div>
                        <span class="category-body-title">
                            {{ snippet.title }}
                        </span>
                    </div>
                </div>
            </div>
        </FTabPane>
    </FTabs>
</template>
<script lang="ts">
import {
    defineComponent,
    PropType,
    ref,
    shallowRef,
    Ref,
    computed,
    onBeforeUnmount,
    onBeforeMount,
} from 'vue';
import { Editor } from '@webank/letgo-editor-core';
import { AssetsJson, Snippet } from '@webank/letgo-types';
import { FInput, FTabPane, FTabs } from '@fesjs/fes-design';
import {
    SearchOutlined,
    DownOutlined,
    UpOutlined,
} from '@fesjs/fes-design/icon';

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
    },
    components: {
        FInput,
        FTabPane,
        FTabs,
        SearchOutlined,
        UpOutlined,
        DownOutlined,
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

        const toggle = (item: CategoryType) => {
            item.show.value = !item.show.value;
        };

        const onSearch = (val: string) => {
            searchText.value = val;
        };

        let unwatch: () => void;
        onBeforeMount(() => {
            unwatch = props.editor.onGot('assets', (assets) => {
                assetsRef.value = assets;
            });
        });

        onBeforeUnmount(() => {
            if (unwatch) {
                unwatch();
            }
        });

        const handleDragstart = (event: DragEvent, snippet: Snippet) => {
            console.log(event, snippet);
            const target = event.target as HTMLElement;
            const image = target.children[0].children[0];
            event.dataTransfer.setDragImage(
                image,
                image.clientWidth / 2,
                image.clientHeight / 2,
            );
        };

        return {
            assetsRef,
            groupListRef,
            categoryListRef,
            toggle,
            onSearch,
            handleDragstart,
        };
    },
});
</script>
<style lang="less" scoped>
.search {
    padding: 8px 16px;
}
.icon {
    cursor: pointer;
}
.category-wrapper {
}
.category-title {
    display: flex;
    height: 42px;
    padding: 0 16px;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #dfdfdf;
    border-top: 1px solid #dfdfdf;
    margin-top: -1px;
}
.category-body {
    display: flex;
    flex-wrap: wrap;
    &-item {
        width: 33.3333333333%;
        height: 114px;
        flex-shrink: 0;
        padding: 14px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        flex-grow: 0;
        border-right: 1px solid #eaeaea;
        border-bottom: 1px solid #eaeaea;
        box-shadow: 0 0 0 0 rgb(0 0 0 / 15%);
        transition: box-shadow 0.2s ease, -webkit-box-shadow 0.2s ease;
        &:hover {
            box-shadow: 0 6px 16px 0 rgb(0 0 0 / 15%);
            border-color: transparent;
        }
        &-icon {
            width: 56px;
            height: 56px;
            margin: 0 1px;
            display: flex;
            justify-items: center;
            img {
                width: 100%;
            }
        }
        &-title {
            width: 100%;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            text-align: center;
        }
    }
}
</style>
