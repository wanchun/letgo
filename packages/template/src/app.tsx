import { defineRuntimeConfig } from '@fesjs/fes';
import { FConfigProvider } from '@fesjs/fes-design';
import { plugins } from '@webank/letgo-engine';
import PluginComponents from '@webank/letgo-plugin-components';
import PluginComponentTree from '@webank/letgo-plugin-component-tree';
import PluginDevice from '@webank/letgo-plugin-device';
import CodeGenerator from '@webank/letgo-plugin-code-generator';
import type { App } from 'vue';
import assets from './assets/assets';
import PluginLogo from './plugins/plugin-logo';
import PluginPreview from './plugins/plugin-preview-sample';

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
plugins.register(PluginLogo);
plugins.register(PluginPreview);

export default defineRuntimeConfig({
    onAppCreated({ app }: { app: App }) {
        app.config.warnHandler = (msg: string) => {
            // 忽略这个警告，生产不会遍历 component instance 的 keys
            if (!msg.includes('enumerating keys'))
                console.warn(msg);
        };
    },
    rootContainer(Container) {
        return () => {
            return (
                <FConfigProvider themeOverrides={{ common: { fontSizeBase: '12px' } }}>
                    <Container />
                </FConfigProvider>
            );
        };
    },
});
