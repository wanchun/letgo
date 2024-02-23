import { definePlugin } from '@webank/letgo-engine-plugin';
import { UndoRedoView } from './content';

export default definePlugin({
    name: 'PluginUndoRedo',
    init(ctx, options) {
        ctx.skeleton.add({
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
});
