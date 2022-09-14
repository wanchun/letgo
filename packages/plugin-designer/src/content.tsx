import { defineComponent, PropType, onBeforeMount, ref, reactive } from 'vue';
import { IPluginContext } from '@webank/letgo-engine';
import { engineConfig } from '@webank/letgo-editor-core';
import { DesignerView, Designer } from '@webank/letgo-designer';
import './content.less';

export default defineComponent({
    name: 'PluginDesignerContent',
    props: {
        ctx: {
            type: Object as PropType<IPluginContext>,
        },
    },
    setup(props) {
        const { ctx } = props;
        const { editor, designer } = ctx;

        const componentMetadatas = ref();

        const simulatorProps = reactive({});

        const handleDesignerMount = (designer: Designer): void => {
            editor.emit('designer.ready', designer);
            editor.onGot('schema', (schema) => {
                designer.project.open(schema);
            });
        };

        onBeforeMount(async () => {
            const assets = await editor.onceGot('assets');
            const renderEnv = engineConfig.get('renderEnv');
            const device = engineConfig.get('device');
            const locale = engineConfig.get('locale');
            const designMode = engineConfig.get('designMode');
            const deviceClassName = engineConfig.get('deviceClassName');
            const simulatorUrl = engineConfig.get('simulatorUrl');

            const { components, packages, extraEnvironment, utils } = assets;

            componentMetadatas.value = components || [];

            Object.assign(simulatorProps, {
                library: packages || [],
                utilsMetadata: utils || [],
                extraEnvironment,
                renderEnv,
                device,
                designMode,
                deviceClassName,
                simulatorUrl,
                locale,
            });
        });

        return () => {
            return (
                <DesignerView
                    class="letgo-plugin-designer"
                    editor={editor}
                    designer={designer}
                    onMount={handleDesignerMount}
                    componentMetadatas={componentMetadatas.value}
                    simulatorProps={simulatorProps}
                />
            );
        };
    },
});
