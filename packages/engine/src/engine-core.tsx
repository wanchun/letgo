import type { App } from 'vue';
import { createApp } from 'vue';
import { isPlainObject } from 'lodash-es';
import { Designer } from '@fesjs/letgo-designer';
import type { IEngineOptions } from '@fesjs/letgo-editor-core';
import { editor, engineConfig } from '@fesjs/letgo-editor-core';
import { Skeleton, WorkbenchView } from '@fesjs/letgo-editor-skeleton';
import engineExt from '@fesjs/letgo-engine-ext';
import type {
    IPluginPreference,
} from '@fesjs/letgo-engine-plugin';
import {
    PluginContext,
    PluginManager,
} from '@fesjs/letgo-engine-plugin';
import PluginDesigner from '@fesjs/letgo-plugin-designer';
import PluginSetting from '@fesjs/letgo-plugin-setting';
import PluginCodeView from '@fesjs/letgo-plugin-code';

export type { IPluginConfig } from '@fesjs/letgo-engine-plugin';

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
