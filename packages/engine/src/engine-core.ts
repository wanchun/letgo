import { createApp } from 'vue';
import { isPlainObject } from 'lodash-es';
import { Designer } from '@webank/letgo-designer';
import { editor, EngineOptions, engineConfig } from '@webank/letgo-editor-core';
import { Skeleton } from '@webank/letgo-editor-skeleton';
import PluginDesigner from '@webank/letgo-plugin-designer';
import { PluginManager, IPluginContext, PluginPreference } from './plugins';
import { Workbench } from '../../editor-skeleton/src';

const plugins = new PluginManager(editor).toProxy();
editor.set('plugins' as any, plugins);

const designer = new Designer({ editor });
editor.set('designer' as any, designer);

const skeleton = new Skeleton(editor);
editor.set('skeleton' as any, skeleton);

export const version = '1.0.0';
engineConfig.set('ENGINE_VERSION', 1);

export { plugins };

// 注册一批内置插件
(async function registerPlugins() {
    //注册默认的面板
    plugins.register({
        name: '___default_panel___',
        init(ctx: IPluginContext) {
            console.log(ctx);
        },
    });

    plugins.register(PluginDesigner);
})();

let isEngineMounted = false;
export async function init(
    container?: HTMLElement,
    options?: EngineOptions,
    pluginPreference?: PluginPreference,
): Promise<() => void> {
    if (isEngineMounted) return;
    isEngineMounted = true;
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

    const app = createApp(Workbench, {
        skeleton,
    });
    app.mount(engineContainer);

    /**
     * 清除实例
     */
    return function destroy() {
        app.unmount();
        //TODO 清除创建的各种实例
    };
}
