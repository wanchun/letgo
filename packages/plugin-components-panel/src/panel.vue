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
                    >
                        <div class="category-body-item-icon">
                            <img
                                :src="snippet.screenshot"
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
    Ref,
    computed,
    onBeforeUnmount,
    onBeforeMount,
    reactive,
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
    show: boolean;
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
        const assetsRef: Ref<AssetsJson> = ref({});

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
                    const categoryObj: CategoryType = reactive({
                        category,
                        snippets: [],
                        show: true,
                    });
                    assetsRef.value.components.forEach((component) => {
                        if (
                            component.group === group &&
                            component.category === category
                        ) {
                            categoryObj.snippets = categoryObj.snippets.concat(
                                component.snippets
                                    .map((snippet) => {
                                        return {
                                            title: component.title,
                                            screenshot: component.screenshot,
                                            ...snippet,
                                        };
                                    })
                                    .filter((snippet) => {
                                        if (!searchText.value) {
                                            return true
                                        }
                                        return snippet.title.indexOf(searchText.value) !== -1
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
            item.show = !item.show;
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

        return {
            assetsRef,
            groupListRef,
            categoryListRef,
            toggle,
            onSearch,
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
