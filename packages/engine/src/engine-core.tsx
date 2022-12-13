import { createApp, App } from 'vue';
import { isPlainObject } from 'lodash-es';
import { Designer } from '@webank/letgo-designer';
import { editor, EngineOptions, engineConfig } from '@webank/letgo-editor-core';
import { Skeleton, Workbench } from '@webank/letgo-editor-skeleton';
import PluginDesignerView from '@webank/letgo-plugin-designer';
import PluginSettingView from '@webank/letgo-plugin-setting';
import engineExt from '@webank/letgo-engine-ext';
import {
    PluginManager,
    IPluginContext,
    PluginPreference,
    Project,
    Material,
} from '@webank/letgo-plugin-manager';

const plugins = new PluginManager(editor).toProxy();
editor.set('plugins' as any, plugins);

const designer = new Designer({ editor });
editor.set('designer' as any, designer);

const skeleton = new Skeleton(editor);
editor.set('skeleton' as any, skeleton);

export const version = '1.0.0';
engineConfig.set('ENGINE_VERSION', 1);

const { project: innerProject } = designer;
const project = new Project(innerProject);
const material = new Material(editor, designer);

export { plugins, project, material };

// 注册一批内置插件
(async function registerPlugins() {
    // 处理 editor.set('assets')，将组件元数据创建好
    plugins.register({
        name: '___component_meta_parser___',
        init(ctx: IPluginContext) {
            const { editor, designer } = ctx;
            editor.onGot('assets', (assets: any) => {
                const { components = [] } = assets;
                designer.buildComponentMetaMap(components);
            });
        },
    });
    // 注册默认的 setters
    plugins.register({
        name: '___setter_registry___',
        init(ctx: IPluginContext) {
            const { setters } = ctx;
            setters.register(engineExt.setters);
        },
    });
    //注册默认的面板
    plugins.register({
        name: '___default_panel___',
        init(ctx: IPluginContext) {
            ctx.skeleton.add({
                name: 'ComponentsPanel',
                area: 'mainArea',
                type: 'Widget',
                content: () => <PluginDesignerView ctx={ctx} />,
            });

            const setterPanel = ctx.skeleton.add({
                name: 'setterPanel',
                area: 'rightArea',
                type: 'Panel',
                content: () => <PluginSettingView ctx={ctx} />,
            });
            setterPanel.show();
        },
    });
})();

let app: App;

export async function init(
    container?: HTMLElement,
    options?: EngineOptions,
    pluginPreference?: PluginPreference,
): Promise<() => void> {
    if (app) return;
    let engineOptions = null;
    let engineContainer = null;
    if (isPlainObject(container)) {
        engineOptions = container as EngineOptions;
        engineContainer = document.createElement('div');
        document.body.appendChild(engineContainer);
    } else {
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

    app = createApp(Workbench, {
        skeleton,
    });
    app.mount(engineContainer);
}

export async function destroy() {
    app.unmount();
    app = null;
    const { project } = designer;
    const { documents } = project;
    if (Array.isArray(documents) && documents.length > 0) {
        documents.forEach((doc) => project.removeDocument(doc));
    }
}
