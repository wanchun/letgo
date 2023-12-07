import type { PropType } from 'vue';
import { defineComponent, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { Designer } from '@harrywan/letgo-designer';
import type { IEngineOptions } from '@harrywan/letgo-editor-core';
import { editor, engineConfig } from '@harrywan/letgo-editor-core';
import { Skeleton, WorkbenchView } from '@harrywan/letgo-editor-skeleton';
import engineExt from '@harrywan/letgo-engine-ext';
import type {
    IPluginPreference,
} from '@harrywan/letgo-engine-plugin';
import {
    PluginContext,
    PluginManager,
} from '@harrywan/letgo-engine-plugin';
import PluginDesigner from '@harrywan/letgo-plugin-designer';
import PluginSetting from '@harrywan/letgo-plugin-setting';
import PluginComponents from '@harrywan/letgo-plugin-components';
import PluginComponentTree from '@harrywan/letgo-plugin-component-tree';
import PluginCode from '@harrywan/letgo-plugin-code';
import PluginGlobalConfig from '@harrywan/letgo-plugin-global';
import './global.less'

export type { IPluginConfig } from '@harrywan/letgo-engine-plugin';

const innerDesigner = new Designer({ editor });

const innerSkeleton = new Skeleton(editor, innerDesigner);

const innerPlugins = new PluginManager(innerDesigner, innerSkeleton).toProxy();

export const version = ENGINE_VERSION_PLACEHOLDER;

engineConfig.set('ENGINE_VERSION', version);

const { config, designer, plugins, skeleton, material, project, hotkey, setters } = new PluginContext(innerPlugins, {
    pluginName: 'CommonPlugin',
});

export { editor, config, designer, plugins, skeleton, material, project, hotkey, setters };

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
    innerPlugins.register(PluginGlobalConfig);
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
