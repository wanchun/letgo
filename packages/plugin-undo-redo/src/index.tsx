import { definePlugin } from '@webank/letgo-engine-plugin';
import type { Panel, Widget } from '@webank/letgo-editor-skeleton';
import { UndoRedoView } from './content';

let widget: Widget | undefined;

export default definePlugin({
    name: 'PluginUndoRedo',
    init(ctx, options) {
        widget = ctx.skeleton.add({
            area: options?.area ?? 'toolbarArea',
            name: 'PluginUndoRedoSkeleton',
            type: 'Widget',
            props: options?.props ?? {
                description: '回撤/恢复',
                align: 'right',
            },
            render: () => <UndoRedoView designer={ctx.designer} />,
        });
    },
    destroy({ skeleton }) {
        skeleton.remove(widget?.config);
        widget = undefined;
    },
});
