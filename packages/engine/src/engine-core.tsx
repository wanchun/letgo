import type { PropType } from 'vue';
import { defineComponent, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';
import { Designer, registerMetadataTransducer } from '@webank/letgo-designer';
import type { IEngineOptions } from '@webank/letgo-editor-core';
import { Hotkey, editor, engineConfig } from '@webank/letgo-editor-core';
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
import { DefaultContextMenu } from './inner-plugins/default-context-menu';
import { BuiltinHotkey } from './inner-plugins/builtin-hotkey';
import './global.less';

const innerDesigner = new Designer({ editor });

const innerSkeleton = new Skeleton(editor, innerDesigner);
const innerHotKey = new Hotkey();

const innerPlugins = new PluginManager(innerDesigner, innerSkeleton, innerHotKey).toProxy();

export const version = ENGINE_VERSION_PLACEHOLDER;

engineConfig.set('ENGINE_VERSION', version);

const { config, designer, plugins, skeleton, material, project, hotkey, setters } = new PluginContext(innerPlugins, {
    pluginName: 'CommonPlugin',
});

export { editor, config, designer, plugins, skeleton, material, project, hotkey, setters, registerMetadataTransducer };

// 注册一批内置插件
function loadBuiltInPlugins() {
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
    innerPlugins.register(BuiltinHotkey);

    return async () => {
        await innerPlugins.delete('setter_registry');
        await innerPlugins.delete(PluginComponentTree.name);
        await innerPlugins.delete(PluginComponents.name);
        await innerPlugins.delete(PluginCode.name);
        await innerPlugins.delete(PluginDesigner.name);
        await innerPlugins.delete(PluginSetting.name);
        await innerPlugins.delete(DefaultContextMenu.name);
        await innerPlugins.delete(BuiltinHotkey.name);
    };
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

        let unInstall: () => Promise<void>;

        onBeforeMount(async () => {
            if (props.options)
                engineConfig.setEngineOptions(props.options);

            unInstall = loadBuiltInPlugins();

            await plugins.init(props.pluginPreference);

            isReady.value = true;

            props.onReady?.();
        });

        watch(() => props.options, () => {
            if (props.options)
                engineConfig.setEngineOptions(props.options);
        }, {
            deep: true,
        });

        onBeforeUnmount(async () => {
            await unInstall();
            designer.purge();
        });

        return () => {
            if (!isReady.value)
                return null;
            return <WorkbenchView skeleton={innerSkeleton}></WorkbenchView>;
        };
    },
});
