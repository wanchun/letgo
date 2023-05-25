import type { IPluginConfig } from '@webank/letgo-plugin-manager';
import { TreeList } from '@icon-park/vue-next';
import type {
    PropType,
} from 'vue';
import {
    defineComponent,
} from 'vue';
import type { Designer } from '@webank/letgo-designer';
import type { Editor } from '@webank/letgo-editor-core';
import { iconCls } from './index.css';

const ComponentTreeView = defineComponent({
    props: {
        editor: {
            type: Object as PropType<Editor>,
        },
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup(props) {
        return () => {
            return '组件树';
        };
    },
});

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
            panelContent: () => <ComponentTreeView editor={editor} designer={designer} />,
            panelProps: {
                width: 300,
                title: '组件树',
            },
        });
    },
} as IPluginConfig;
