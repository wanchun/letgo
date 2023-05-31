import type { App } from 'vue';
import { createApp } from 'vue';
import { isPlainObject } from 'lodash-es';
import { Designer } from '@webank/letgo-designer';
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
import PluginCodeView from '@webank/letgo-plugin-code';

const innerDesigner = new Designer({ editor });

const innerSkeleton = new Skeleton(editor, innerDesigner);

const innerPlugins = new PluginManager(innerDesigner, innerSkeleton).toProxy();

export const version = 'ENGINE_VERSION_PLACEHOLDER';

engineConfig.set('ENGINE_VERSION', version);

const { config, designer, plugins, skeleton, material, project, hotkey, setters } = new PluginContext(innerPlugins, {
    pluginName: 'CommonPlugin',
});

export { editor, config, designer, plugins, skeleton, material, project, hotkey, setters };

// 注册一批内置插件
(async function registerPlugins() {
    // 处理 editor.set('assets')，将组件元数据创建好
    innerPlugins.register({
        name: '___component_meta_parser___',
        init(ctx) {
            const { editor, designer } = ctx;
            editor.onGot('assets', (assets: any) => {
                const { components = [] } = assets;
                designer.buildComponentMetaMap(components);
            });
        },
    });
    // 注册默认的 setters
    innerPlugins.register({
        name: '___setter_registry___',
        init(ctx) {
            const { setters } = ctx;
            setters.register(engineExt.setters);
        },
    });
    innerPlugins.register(PluginCodeView);
    // 注册默认的面板
    innerPlugins.register(PluginDesigner);
    innerPlugins.register(PluginSetting);
})();

let app: App;

export async function init(
    container?: HTMLElement,
    options?: IEngineOptions,
    pluginPreference?: IPluginPreference,
): Promise<() => void> {
    if (app)
        return;
    let engineOptions = null;
    let engineContainer = null;
    if (isPlainObject(container)) {
        engineOptions = container as IEngineOptions;
        engineContainer = document.createElement('div');
        document.body.appendChild(engineContainer);
    }
    else {
        engineOptions = options;
        engineContainer = container;
        if (!container) {
            engineContainer = document.createElement('div');
            document.body.appendChild(engineContainer);
        }
    }
    engineContainer.id = 'engine';
    engineConfig.setEngineOptions(engineOptions);
    await plugins.init(pluginPreference);

    app = createApp(WorkbenchView, {
        skeleton: innerSkeleton,
    });
    app.mount(engineContainer);
}

export async function destroy() {
    app.unmount();
    app = null;
    const { project } = designer;
    const { documents } = project;
    if (Array.isArray(documents) && documents.length > 0)
        documents.forEach(doc => project.removeDocument(doc));
}
