import { definePlugin } from '@webank/letgo-engine-plugin';
import { TreeList } from '@icon-park/vue-next';
import { FTooltip } from '@fesjs/fes-design';
import './component-tree.less';
import { TreeView } from './Tree';

let clearDragstart: () => void;
let clearDragend: () => void;

export default definePlugin({
    name: 'PluginComponentTree',
    init({ skeleton, editor, designer }) {
        const pluginComponentTreePanel = skeleton.add({
            type: 'Panel',
            area: 'leftFloatArea',
            name: 'PluginComponentTreePanel',
            render: () => <TreeView editor={editor} designer={designer} />,
            props: {
                width: 300,
                title: '大纲树',
            },
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

        clearDragstart = designer.dragon.onDragstart(() => {
            pluginComponentTreePanel.setParent(skeleton.rightArea);
            pluginComponentTreePanel.show();
        });

        clearDragend = designer.dragon.onDragend(() => {
            pluginComponentTreePanel.setParent(skeleton.leftFloatArea);
            pluginComponentTreePanel.hide();
            skeleton.rightArea.get('setterPanel').show();
        });
    },
    destroy() {
        clearDragstart?.();
        clearDragend?.();
    },
});
