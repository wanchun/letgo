import type { PropType } from 'vue';
import { defineComponent, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { Designer, registerMetadataTransducer } from '@webank/letgo-designer';
import type { IEngineOptions } from '@webank/letgo-editor-core';
import { editor, engineConfig } from '@webank/letgo-editor-core';
import { Skeleton, WorkbenchView } from '@webank/letgo-editor-skeleton';
import engineExt from '@webank/letgo-engine-ext';
import type {
    IPluginPreference,
} from '@webank/letgo-engine-plugin';
import {
    PluginContext,
    PluginManager,
} from '@webank/letgo-engine-plugin';
import PluginDesigner from '@webank/letgo-plugin-designer';
import PluginSetting from '@webank/letgo-plugin-setting';
import PluginComponents from '@webank/letgo-plugin-components';
import PluginComponentTree from '@webank/letgo-plugin-component-tree';
import PluginCode from '@webank/letgo-plugin-code';
import { DefaultContextMenu } from './default-context-menu';
import './global.less';

export { StyleSetter, IconSetter } from '@webank/letgo-engine-ext';
export { definePlugin } from '@webank/letgo-engine-plugin';
export type { IPluginConfig } from '@webank/letgo-engine-plugin';

const innerDesigner = new Designer({ editor });

const innerSkeleton = new Skeleton(editor, innerDesigner);

const innerPlugins = new PluginManager(innerDesigner, innerSkeleton).toProxy();

export const version = ENGINE_VERSION_PLACEHOLDER;

engineConfig.set('ENGINE_VERSION', version);

const { config, designer, plugins, skeleton, material, project, hotkey, setters } = new PluginContext(innerPlugins, {
    pluginName: 'CommonPlugin',
});

export { editor, config, designer, plugins, skeleton, material, project, hotkey, setters, registerMetadataTransducer };

// 注册一批内置插件
(async function registerPlugins() {
    // 处理 editor.set('assets')，将组件元数据创建好
    innerPlugins.register({
        name: 'component_meta_parser',
        init(ctx) {
            const { editor, designer, project } = ctx;
            editor.onGot('assets', (assets: any) => {
                const { components = [] } = assets;
                designer.buildComponentMetaMap(components);
                project.setUtils(assets.utils);
            });
        },
    });
    // 注册默认的 setters
    innerPlugins.register({
        name: 'setter_registry',
        init(ctx) {
            const { setters } = ctx;
            setters.register(engineExt.setters);
        },
    });
    // 注册默认插件
    innerPlugins.register(PluginComponentTree);
    innerPlugins.register(PluginComponents);
    innerPlugins.register(PluginCode);
    innerPlugins.register(PluginDesigner);
    innerPlugins.register(PluginSetting);
    innerPlugins.register(DefaultContextMenu);
})();

export function destroy() {
    const { project } = designer;
    project.purge();
}

export const LetgoEngine = defineComponent({
    name: 'LetgoEngine',
    props: {
        options: Object as PropType<IEngineOptions>,
        pluginPreference: Object as PropType<IPluginPreference>,
        onReady: Function,
    },
    setup(props) {
        const isReady = ref(false);

        onBeforeMount(async () => {
            if (props.options)
                engineConfig.setEngineOptions(props.options);

            await plugins.init(props.pluginPreference);

            isReady.value = true;
            props.onReady?.();
        });

        onBeforeUnmount(destroy);

        return () => {
            if (!isReady.value)
                return null;
            return <WorkbenchView skeleton={innerSkeleton}></WorkbenchView>;
        };
    },
});
