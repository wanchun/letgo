import type {
    PropType,
    ShallowReactive,
} from 'vue';
import {
    defineComponent,
    onBeforeMount,
    onBeforeUnmount,
    ref,
    shallowReactive,
} from 'vue';
import type { Designer } from '@webank/letgo-designer';
import { DesignerView } from '@webank/letgo-designer';
import type { IPluginContext } from '@webank/letgo-engine-plugin';
import type { IPublicTypeAssetsJson } from '@webank/letgo-types';
import './designer.less';

export default defineComponent({
    name: 'PluginDesigner',
    props: {
        ctx: {
            type: Object as PropType<IPluginContext>,
        },
    },
    setup(props) {
        const { ctx } = props;
        const { editor, designer, config, project } = ctx;

        const dispose: Array<() => void> = [];

        const componentMetadatas = ref();

        const simulatorProps: ShallowReactive<{ device?: string; library?: [] }>
            = shallowReactive({});

        const onDesignerMount = (designer: Designer): void => {
            editor.emit('designer.ready', designer);
        };

        onBeforeMount(async () => {
            const assets: IPublicTypeAssetsJson = await editor.onceGot('assets');
            const { components, packages, utils } = assets;
            const device = config.get('device');
            const deviceClassName = config.get('deviceClassName');
            const deviceStyle = config.get('deviceStyle');
            const simulatorUrl = config.get('simulatorUrl');
            const designMode = config.get('designMode');
            const letgoRequest = config.get('letgoRequest');
            Object.assign(simulatorProps, {
                simulatorUrl,
                letgoRequest,
                device,
                deviceClassName,
                deviceStyle,
                designMode,
                library: packages || [],
            });
            componentMetadatas.value = components || [];
            project.setUtils(utils);
        });

        dispose.push(config.onGot('device', (val: string) => {
            simulatorProps.device = val;
        }));

        dispose.push(editor.onChange('assets', (assets: IPublicTypeAssetsJson) => {
            const { components, packages, utils } = assets;
            componentMetadatas.value = components || [];
            project.setUtils(utils);
            Object.assign(simulatorProps, {
                library: packages || [],
            });
        }));

        onBeforeUnmount(() => {
            dispose.forEach(fn => fn());
        });

        return () => {
            if (!simulatorProps.library || !componentMetadatas.value)
                return;

            return (
                <DesignerView
                    class="letgo-plg-designer"
                    editor={editor}
                    designer={designer}
                    onMount={onDesignerMount}
                    componentMetadatas={componentMetadatas.value}
                    simulatorProps={simulatorProps}
                />
            );
        };
    },
});
