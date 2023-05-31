import type { IPluginConfig } from '@webank/letgo-engine-plugin';
import { FigmaComponent, Page, Plug, TreeList } from '@icon-park/vue-next';
import type { PropType, VNodeChild } from 'vue';
import {
    computed,
    defineComponent,
} from 'vue';
import type { Designer, INode } from '@webank/letgo-designer';
import type { Editor } from '@webank/letgo-editor-core';
import { FTree } from '@fesjs/fes-design';
import { iconCls, nodeIconCls } from './index.css';

interface Option {
    value: string
    label: string
    children?: Option[]
    prefix?: () => VNodeChild
    suffix?: () => VNodeChild
}

export function transformNode(node: INode, isSlot = false): Option {
    const option: Option = {
        value: node.id,
        label: `${node.title || node.componentName} - ${node.id}`,
    };
    option.children = [...node.slots.map(node => transformNode(node, true)), ...node.children.getNodes().map(node => transformNode(node))];
    option.prefix = () => {
        if (node.componentName === 'Page')
            return <Page class={nodeIconCls} theme="outline" strokeWidth={2} />;

        if (isSlot)
            return <Plug class={nodeIconCls} theme="outline" strokeWidth={2} />;

        return <FigmaComponent class={nodeIconCls} theme="outline" strokeWidth={2} />;
    };

    return option;
}

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
            if (!currentRootNode)
                return [];

            return [transformNode(currentRootNode)];
        });

        const selectedIds = computed(() => {
            return props.designer.currentSelection?.getNodes().map(node => node.id) ?? [];
        });

        const onSelectNode = ({ node }: { node: { value: string } }) => {
            props.designer.currentSelection.select(node.value);
        };
        return () => {
            return <FTree
                data={data.value}
                selectedKeys={selectedIds.value}
                onSelect={onSelectNode}
                defaultExpandAll
            />;
        };
    },
});

export default {
    name: 'PluginComponentTree',
    init({ skeleton, editor, designer }) {
        skeleton.add({
            area: 'leftArea',
            type: 'Widget',
            name: 'PluginComponentTreeWidget',
            render: () => <TreeList theme="outline" strokeWidth={2} class={iconCls} />,
        }).link(
            skeleton.add({
                type: 'Panel',
                area: 'leftFloatArea',
                name: 'PluginComponentTreePanel',
                render: () => <ComponentTreeView editor={editor} designer={designer} />,
                props: {
                    width: 300,
                    title: '组件树',
                },
            }),
        );
    },
} as IPluginConfig;
