import type { IPluginConfig } from '@webank/letgo-plugin-manager';
import { TreeList } from '@icon-park/vue-next';
import type { PropType } from 'vue';
import {
    computed,
    defineComponent,
} from 'vue';
import type { Designer } from '@webank/letgo-designer';
import type { Editor } from '@webank/letgo-editor-core';
import { FTree } from '@fesjs/fes-design';
import { iconCls } from './index.css';
import { transformNode } from './utils';

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
        const data = computed(() => {
            const currentRootNode = props.designer.currentDocument?.root;
            console.log('currentRootNode:', currentRootNode);
            if (!currentRootNode)
                return [];

            return [transformNode(currentRootNode)];
        });
        return () => {
            return <FTree data={data.value}/>;
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
