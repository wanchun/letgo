import { definePlugin } from '@webank/letgo-engine-plugin';
import { TreeList } from '@icon-park/vue-next';
import { FTooltip } from '@fesjs/fes-design';
import './component-tree.less';
import { ContentView } from './content';

let clearDragstart: () => void;
let clearDragend: () => void;

export default definePlugin({
    name: 'PluginComponentTree',
    init({ skeleton, editor, designer }) {
        const pluginComponentTreePanel = skeleton.add({
            type: 'Panel',
            area: 'leftFloatArea',
            name: 'PluginComponentTreePanel',
            render: () => <ContentView editor={editor} designer={designer} />,
            props: {
                width: 300,
                title: '大纲树',
            },
            defaultFixed: false,
        });
        skeleton
            .add({
                area: 'leftArea',
                type: 'Widget',
                name: 'PluginComponentTreeWidget',
                render: () => (
                    <FTooltip content="大纲树" placement="right">
                        <TreeList theme="outline" class="letgo-comp-tree__icon" />
                    </FTooltip>
                ),
            })
            .link(pluginComponentTreePanel);
    },
    destroy() {
        clearDragstart?.();
        clearDragend?.();
    },
});
