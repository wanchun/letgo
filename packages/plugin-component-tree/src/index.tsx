import type { IPluginConfig } from '@harrywan/letgo-engine-plugin';
import { FigmaComponent, Page, Plug, TreeList } from '@icon-park/vue-next';
import type { PropType, Ref, VNodeChild } from 'vue';
import {
    computed,
    defineComponent,
    onBeforeUnmount,
    ref,
} from 'vue';
import type { Designer, INode } from '@harrywan/letgo-designer';
import type { Editor } from '@harrywan/letgo-editor-core';
import { FInput, FScrollbar, FTooltip, FTree } from '@fesjs/fes-design';
import { SearchOutlined } from '@fesjs/fes-design/icon';
import { iconCls, nodeIconCls, searchCls, treeCls, wrapperCls } from './index.css';
import { SuffixView } from './suffix';

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
        label: `${node.title || node.componentName}`,
    };
    option.children = [...node.slots.map(node => transformNode(node, true)), ...node.children.getNodes().map(node => transformNode(node))];
    option.prefix = () => {
        if (node.componentName === 'Page')
            return <Page class={nodeIconCls} theme="outline" />;

        if (isSlot)
            return <Plug class={nodeIconCls} theme="outline" />;

        return <FigmaComponent class={nodeIconCls} theme="outline" />;
    };
    option.suffix = () => {
        return <SuffixView node={node}></SuffixView>;
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
        const isSimulatorReady: Ref<boolean> = ref(false);

        const clear = props.designer.onRendererReady(() => {
            isSimulatorReady.value = true;
        });

        onBeforeUnmount(clear);

        const data = computed(() => {
            // 必须等 RendererReady，才能正确拿到Page的schema
            if (!isSimulatorReady.value)
                return [];

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

        const refTree = ref();

        const onSearch = (val: string) => {
            refTree.value.filter(val);
        };

        const filterMethod = (value: string, node: { label: string }) => {
            return node.label.includes(value);
        };

        return () => {
            return (
                <div class={wrapperCls}>
                    <div class={searchCls}>
                        <FInput
                            placeholder="请输入"
                            clearable
                            onInput={onSearch}
                            v-slots={{
                                suffix: () => <SearchOutlined />,
                            }}
                        ></FInput>
                    </div>
                    <FScrollbar class={treeCls} contentStyle={{ marginTop: '8px' }}>
                        <FTree
                            ref={refTree}
                            data={data.value}
                            selectedKeys={selectedIds.value}
                            onSelect={onSelectNode}
                            filterMethod={filterMethod}
                            defaultExpandAll
                        />
                    </FScrollbar>
                </div>
            );
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
            render: () => <FTooltip content="大纲树" placement="right"><TreeList theme="outline" class={iconCls} /></FTooltip>,
        }).link(
            skeleton.add({
                type: 'Panel',
                area: 'leftFloatArea',
                name: 'PluginComponentTreePanel',
                render: () => <ComponentTreeView editor={editor} designer={designer} />,
                props: {
                    width: 300,
                    title: '大纲树',
                },
            }),
        );
    },
} as IPluginConfig;
