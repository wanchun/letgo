import { defineRuntimeConfig } from '@fesjs/fes';
import { FConfigProvider } from '@fesjs/fes-design';
import { plugins, registerMetadataTransducer } from '@webank/letgo-engine';
import PluginDevice from '@webank/letgo-plugin-device';
import PluginSchema from '@webank/letgo-plugin-schema';
import type { App } from 'vue';
import type { IPublicTypeFieldConfig } from '../../types/es';
import PluginLogo from './plugins/plugin-logo';
import PluginPreview from './plugins/plugin-preview-sample';
import PluginCodeGenerator from './plugins/plugin-code-generator';

const injectGroup: IPublicTypeFieldConfig = {
    name: 'action',
    title: '权限',
    type: 'group',
    extraProps: {
        display: 'block',
    },
    items: [
        {
            name: 'v-access',
            title: '资源ID',
            setter: 'StringSetter',
            defaultValue: '',
            supportVariable: false,
        },
    ],
};
registerMetadataTransducer((metadata) => {
    if (metadata.configure)
        metadata.configure.props.push(injectGroup);
    return metadata;
}, 100, 'inject-custom');

plugins.register(PluginDevice);
plugins.register(PluginSchema);
plugins.register(PluginLogo);
plugins.register(PluginPreview);
plugins.register(PluginCodeGenerator);

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
                <FConfigProvider>
                    <Container />
                </FConfigProvider>
            );
        };
    },
});
