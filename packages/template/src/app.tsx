import { h } from 'vue';
import { plugins } from '@webank/letgo-engine';
import PluginComponents from '@webank/letgo-plugin-components';
import PluginComponentTree from '@webank/letgo-plugin-component-tree';
import PluginDevice from '@webank/letgo-plugin-device';
import CodeGenerator from '@webank/letgo-plugin-code-generator';
import assets from './assets/assets';
import Logo from './assets/logo.vue';

plugins.register({
    name: 'editor-init',
    init({ material }) {
        material.setAssets(assets);
    },
});

plugins.register(PluginComponents);
plugins.register(PluginComponentTree);
plugins.register(CodeGenerator);
plugins.register(PluginDevice);

plugins.register({
    name: 'skeleton',
    init({ skeleton }) {
        skeleton.add({
            name: 'widget',
            area: 'topArea',
            type: 'Widget',
            render: () => h(Logo),
            props: {
                align: 'left',
            },
        });
    },
});
