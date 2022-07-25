<template>
    <FInput placeholder="请输入">
        <template #append>
            <SearchOutlined />
        </template>
    </FInput>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Editor } from '@webank/letgo-editor-core';
import { FInput } from '@fesjs/fes-design';
import { SearchOutlined } from '@fesjs/fes-design/icon';

export default defineComponent({
    props: {
        editor: {
            type: Object as PropType<Editor>,
        },
    },
    components: {
        FInput,
        SearchOutlined,
    },
    setup() {
        return {};
    },
});
</script>
<style scoped>
.icon {
    cursor: pointer;
}
</style>
