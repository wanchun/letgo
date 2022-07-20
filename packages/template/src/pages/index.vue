<template>
    <div ref="containerRef" class="engine"></div>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, h } from 'vue';
import { init, plugins } from '@webank/letgo-engine';
import { HomeOutlined } from '@fesjs/fes-design/icon';

plugins.register({
    name: 'logo',
    init({ skeleton }) {
        skeleton.add({
            name: 'logo',
            area: 'topArea',
            type: 'Widget',
            content: () => 'Letgo 低代码平台',
            props: {
                align: 'left',
            },
        });
        skeleton.add({
            name: 'test',
            area: 'leftArea',
            type: 'WidgetModal',
            content: () => h(HomeOutlined),
            props: {
                align: 'top',
            },
            modalContent: () => '我是内容',
            modalProps: {
                title: '我是标题',
            },
        });
    },
});

export default defineComponent({
    setup() {
        const containerRef = ref(null);

        let destroy: () => void;

        onMounted(async () => {
            destroy = await init(containerRef.value, {});
        });

        onBeforeUnmount(() => {
            if (destroy) {
                destroy();
            }
        });

        return {
            containerRef,
        };
    },
});
</script>
<style>
.engine {
    width: 100%;
    height: 100%;
}
</style>
