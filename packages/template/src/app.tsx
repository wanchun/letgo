import { h } from 'vue';
import { plugins } from '@webank/letgo-engine';
import PluginComponents from '@webank/letgo-plugin-components';
import assets from './assets/assets.json';
import Logo from './assets/logo.vue';
import ExportCode from './components/exportCode.vue';

plugins.register({
    name: 'editor-init',
    init({ material }) {
        material.setAssets(assets);
    },
});

plugins.register(PluginComponents);

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
        skeleton.add({
            name: 'exportButton',
            area: 'topArea',
            type: 'Widget',
            content: () => h(ExportCode),
            props: {
                align: 'right',
            },
        });
    },
});
