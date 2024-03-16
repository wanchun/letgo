import { defineRuntimeConfig } from '@fesjs/fes';
import { FConfigProvider } from '@fesjs/fes-design';
import { plugins, registerMetadataTransducer } from '@webank/letgo-engine';
import PluginDevice from '@webank/letgo-plugin-device';
import PluginSchema from '@webank/letgo-plugin-schema';
import PluginUndoRedo from '@webank/letgo-plugin-undo-redo';
import type { App } from 'vue';
import type { IPublicTypeFieldConfig } from '../../types/es';
import PluginLogo from './plugins/plugin-logo';
import PluginPreview from './plugins/plugin-preview-sample';
import PluginCodeGenerator from './plugins/plugin-code-generator';

// const injectGroup: IPublicTypeFieldConfig = {
//     name: 'action',
//     title: '权限',
//     type: 'group',
//     extraProps: {
//         display: 'block',
//     },
//     items: [
//         {
//             name: 'v-access',
//             title: '资源ID',
//             setter: 'StringSetter',
//             defaultValue: '',
//             supportVariable: false,
//         },
//     ],
// };
// registerMetadataTransducer((metadata) => {
//     if (metadata.configure)
//         metadata.configure.props.push(injectGroup);
//     return metadata;
// }, 100, 'inject-custom');

plugins.register(PluginDevice);
plugins.register(PluginSchema);
plugins.register(PluginLogo);
plugins.register(PluginUndoRedo, {
    area: 'topArea',
});
plugins.register(PluginPreview);
plugins.register(PluginCodeGenerator);

export default defineRuntimeConfig({
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
