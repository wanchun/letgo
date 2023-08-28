import { defineRuntimeConfig } from '@fesjs/fes';
import { FConfigProvider } from '@fesjs/fes-design';
import { plugins } from '@harrywan/letgo-engine';
import PluginDevice from '@harrywan/letgo-plugin-device';
import PluginSchema from '@harrywan/letgo-plugin-schema';
import PluginGlobalConfig from '@harrywan/letgo-plugin-global';
import type { App } from 'vue';
import PluginLogo from './plugins/plugin-logo';
import PluginPreview from './plugins/plugin-preview-sample';
import assets from './assets/assets';
import { registerGenCode } from './registerGenCode';

plugins.register({
    name: 'editor-init',
    init({ material }) {
        material.setAssets(assets);
    },
});

registerGenCode();
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
