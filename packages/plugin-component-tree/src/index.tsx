import { definePlugin } from '@webank/letgo-engine-plugin';
import type { Panel, Widget } from '@webank/letgo-editor-skeleton';
import { TreeList } from '@icon-park/vue-next';
import { FTooltip } from '@fesjs/fes-design';
import './component-tree.less';
import { ContentView } from './content';

let clearDragstart: () => void;
let clearDragend: () => void;
let widget: Widget | undefined;
let panel: Panel | undefined;

export default definePlugin({
    name: 'PluginComponentTree',
    init({ skeleton, editor, designer }) {
        panel = skeleton.add({
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
        widget = skeleton
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
            .link(panel);
    },
    destroy({ skeleton }) {
        clearDragstart?.();
        clearDragend?.();
        skeleton.remove(widget?.config);
        skeleton.remove(panel?.config);
        widget = undefined;
        panel = undefined;
    },
});
