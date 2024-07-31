<script lang="ts" setup>
import { onBeforeUnmount, reactive } from 'vue';
import { IconSetter, LetgoEngine, material, plugins, project } from '@webank/letgo-engine';
import { createRequest } from '@qlin/request';
import PluginDevice from '@webank/letgo-plugin-device';
import PluginSchema from '@webank/letgo-plugin-schema';
import PluginUndoRedo from '@webank/letgo-plugin-undo-redo';
import PluginCSS from '@webank/letgo-plugin-css';
import PluginLogicEdit from '@webank/letgo-plugin-logic';
import lowcAssets from '../assets/lowcAssets';
import assets from '../assets/assets';
import icons from '../assets/icones-bags';
import page from '../assets/page';
import PluginLogo from '../plugins/plugin-logo';
import PluginPreview from '../plugins/plugin-preview-sample';
import PluginCodeGenerator from '../plugins/plugin-code-generator';
import PluginBottom from '../plugins/plugin-test-bottom';

plugins.register(PluginCSS);
plugins.register(PluginLogicEdit);
plugins.register(PluginDevice);
plugins.register(PluginSchema);
plugins.register(PluginLogo);
plugins.register(PluginUndoRedo, {
    area: 'topArea',
});
plugins.register(PluginPreview);
plugins.register(PluginCodeGenerator);
plugins.register(PluginBottom);

onBeforeUnmount(async () => {
    await plugins.delete(PluginCSS.name);
    await plugins.delete(PluginLogicEdit.name);
    await plugins.delete(PluginDevice.name);
    await plugins.delete(PluginSchema.name);
    await plugins.delete(PluginLogo.name);
    await plugins.delete(PluginUndoRedo.name);
    await plugins.delete(PluginPreview.name);
    await plugins.delete(PluginCodeGenerator.name);
    await plugins.delete(PluginBottom.name);
});

material.setAssets(assets);

IconSetter.defaultIcons = icons;

// project.openDocument({
//     id: 'hello',
//     componentName: 'Component',
//     ref: 'root',
//     fileName: 'hello',
//     props: {},
//     code: {
//         directories: [],
//         code: [],
//     },
// });
project.openDocument({
    componentName: 'Page',
    id: 'hello',
    ref: 'root',
    props: {},
    fileName: 'compText',
    code: {
        directories: [],
        code: [
            {
                id: 'variable1',
                type: 'temporaryState',
                initValue: 'new Array((10 * 1024 * 40) / 4).fill(0)',
            },
            {
                id: 'variable2',
                type: 'temporaryState',
                initValue: '1',
            },
        ],
    },
    isLocked: false,
    condition: true,
    title: '',
    children: [
        {
            componentName: 'FButton',
            id: 'fButton1',
            ref: 'fButton1',
            props: {
                children: {
                    type: 'JSExpression',
                    value: 'variable2.value',
                    mock: null,
                },
            },
            title: '按钮',
            isLocked: false,
            condition: true,
        },
    ],
});
console.log('project:', project);

const options = reactive({
    enableContextMenu: true,
    vueRuntimeUrl:
                    'https://registry.npmmirror.com/vue/latest/files/dist/vue.global.js',
    simulatorUrl: [
                    `${process.env.FES_APP_SIMULATOR_PATH}/letgo-render.umd.js`,
                    `${process.env.FES_APP_SIMULATOR_PATH}/letgo-render.css`,
    ],
    letgoRequest: createRequest({
        mode: 'cors',
        credentials: 'same-origin',
        requestInterceptor(config) {
            return config;
        },
    }),

});
</script>

<template>
    <LetgoEngine class="engine" :options="options" />
</template>

<style>
.engine {
    width: 100%;
    height: 100%;
}
</style>
