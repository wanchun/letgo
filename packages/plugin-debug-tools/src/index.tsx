import { definePlugin } from '@webank/letgo-engine-plugin';

export default definePlugin({
    name: 'PluginUndoRedo',
    init(ctx, options) {
        ctx.skeleton.add({
            area: options?.area ?? 'bottomArea',
            name: 'PluginDebugToolsSkeleton',
            type: 'Widget',
            props: options?.props ?? {
                description: 'debug',
                align: 'right',
            },
            render: () => <div>hello</div>,
        });
    },
});
