import type { IPluginConfig } from '@webank/letgo-plugin-manager';
import { TreeList } from '@icon-park/vue-next';
import { iconCls } from './index.css';
import Panel from './panel';

export default {
    name: 'PluginComponentTree',
    init({ skeleton, editor, designer }) {
        skeleton.add({
            name: 'PluginComponentTreePanel',
            area: 'leftArea',
            type: 'WidgetPanel',
            content: () => <TreeList theme="outline" strokeWidth={2} class={iconCls} />,
            props: {
                align: 'top',
            },
            panelContent: () => <Panel editor={editor} designer={designer} />,
            panelProps: {
                width: 300,
                title: '组件树',
            },
        });
    },
} as IPluginConfig;
