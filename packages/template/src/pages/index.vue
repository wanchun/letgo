<template>
    <div ref="containerRef" class="engine"></div>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, h } from 'vue';
import { init, plugins } from '@webank/letgo-engine';
import PluginComponentsPanel from '@webank/letgo-plugin-components-panel';
import Logo from './components/logo.vue';
import assets from './components/assets.json';

plugins.register({
    name: 'editor-init',
    init({ material, project }) {
        material.setAssets(assets);

        project.openDocument();
        console.log(project);
    },
});

plugins.register(PluginComponentsPanel);

plugins.register({
    name: 'skeleton',
    init({ skeleton, editor }) {
        editor.on('skeleton.widget.show', (...arg) => {
            console.log('skeleton.widget.show', arg);
        });
        skeleton.add({
            name: 'widget',
            area: 'topArea',
            type: 'Widget',
            content: () => h(Logo),
            props: {
                align: 'left',
            },
        });
        // skeleton.add({
        //     name: 'widgetModal',
        //     area: 'leftArea',
        //     type: 'WidgetModal',
        //     content: () => h(HomeOutlined),
        //     props: {
        //         align: 'top',
        //     },
        //     modalContent: () => '我是内容',
        //     modalProps: {
        //         title: '我是标题',
        //         onOk: (widget) => {
        //             widget.hide();
        //         },
        //         onCancel: (widget) => {
        //             widget.hide();
        //         },
        //     },
        // });
        // skeleton.add({
        //     name: 'widgetPanel',
        //     area: 'leftArea',
        //     type: 'WidgetPanel',
        //     content: () => h(HomeOutlined),
        //     props: {
        //         align: 'top',
        //     },
        //     panelContent: () => '我是内容',
        //     panelProps: {
        //         title: '我是标题',
        //     },
        // });
        const panel = skeleton.add({
            name: 'setter',
            area: 'rightArea',
            type: 'Panel',
            content: () => h('div', ['我是设置器', h('input')]),
        });
        panel.show();
        setTimeout(() => {
            const panel1 = skeleton.add({
                name: 'setter2',
                area: 'rightArea',
                type: 'Panel',
                content: () => '我是设置器2',
            });
            panel1.show();
            setTimeout(() => {
                panel.show();
            }, 3000);
        }, 3000);
    },
});

export default defineComponent({
    setup() {
        const containerRef = ref(null);

        let destroy: () => void;

        onMounted(async () => {
            destroy = await init(containerRef.value, {
                simulatorUrl: [
                    `${getPublicPath()}lib/lowcode-vue-simulator/vue-simulator-renderer.js`,
                    `${getPublicPath()}lib/lowcode-vue-simulator/vue-simulator-renderer.css`,
                ],
            });
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
