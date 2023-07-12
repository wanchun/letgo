import { defineRuntimeConfig } from '@fesjs/fes';
import { FConfigProvider } from '@fesjs/fes-design';
import { plugins } from '@fesjs/letgo-engine';
import PluginComponents from '@fesjs/letgo-plugin-components';
import PluginComponentTree from '@fesjs/letgo-plugin-component-tree';
import PluginDevice from '@fesjs/letgo-plugin-device';
import PluginSchema from '@fesjs/letgo-plugin-schema';
import PluginCodeGenerator from '@fesjs/letgo-plugin-code-generator';
import PluginGlobalConfig from '@fesjs/letgo-plugin-global';
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
plugins.register(PluginCodeGenerator);
plugins.register(PluginDevice);
plugins.register(PluginSchema);
plugins.register(PluginLogo);
plugins.register(PluginPreview);
plugins.register(PluginGlobalConfig);

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
