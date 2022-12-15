import { h } from 'vue';
import { plugins } from '@webank/letgo-engine';
import PluginComponents from '@webank/letgo-plugin-components';
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
plugins.register(CodeGenerator);

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
    },
});
