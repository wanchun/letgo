import { FigmaComponent, Page, Plug } from '@icon-park/vue-next';
import type { PropType, Ref, VNodeChild } from 'vue';
import {
    computed,
    defineComponent,
    onBeforeUnmount,
    ref,
} from 'vue';
import { insertChild } from '@webank/letgo-designer';
import type { Designer, INode } from '@webank/letgo-designer';
import type { Editor } from '@webank/letgo-editor-core';
import { FInput, FScrollbar, FTree } from '@fesjs/fes-design';
import { SearchOutlined } from '@fesjs/fes-design/icon';
import { SuffixView } from './suffix';
import './component-tree.less';

interface Option {
    value: string
    label: string
    children?: Option[]
    prefix?: () => VNodeChild
    suffix?: () => VNodeChild
    isLeaf?: boolean
}

function transformNode(node: INode, isSlot = false): Option {
    const option: Option = {
        value: node.id,
        label: `${node.ref} - ${node.title || node.componentName}`,
    };
    option.children = [...node.slots.map(node => transformNode(node, true)), ...node.children.getNodes().map(node => transformNode(node))];
    option.prefix = () => {
        if (node.componentName === 'Page')
            return <Page class="letgo-comp-tree__icon letgo-comp-tree__icon--node" theme="outline" />;

        if (isSlot)
            return <Plug class="letgo-comp-tree__icon letgo-comp-tree__icon--node" theme="outline" />;

        return <FigmaComponent class="letgo-comp-tree__icon letgo-comp-tree__icon--node" theme="outline" />;
    };
    option.suffix = () => {
        return <SuffixView node={node} style={{ marginRight: '8px' }}></SuffixView>;
    };
    option.isLeaf = !node.isContainer;

    return option;
}

export const TreeView = defineComponent({
    props: {
        editor: {
            type: Object as PropType<Editor>,
        },
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup(props) {
        const isSimulatorReady: Ref<boolean> = ref(props.designer.isRendererReady);

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

        const filterMethod = (value: string, node: { label?: string }) => {
            return node?.label.includes(value);
        };

        const onDrop = ({ originNode, originDragNode, position }: { originNode: Option, originDragNode: Option, position: 'before' | 'after' | 'inside' }) => {
            const document = props.designer.currentDocument;
            const targetNode = document.getNode(originNode.value);
            if ((position === 'before' || position === 'after') && targetNode.componentName === 'Page')
                return;

            const dragNode = document.getNode(originDragNode.value);
            if (position === 'inside') {
                const dragNode = document.getNode(originDragNode.value);
                insertChild(targetNode, dragNode, 0);
            }
            else if (position === 'before') {
                const index = targetNode.parent.children.indexOf(targetNode);
                insertChild(targetNode.parent, dragNode, index);
            }
            else if (position === 'after') {
                const index = targetNode.parent.children.indexOf(targetNode);
                insertChild(targetNode.parent, dragNode, index + 1);
            }
        };

        return () => {
            return (
                <div class="letgo-comp-tree">
                    <div class="letgo-comp-tree__search">
                        <FInput
                            placeholder="请输入"
                            clearable
                            onInput={onSearch}
                            v-slots={{
                                suffix: () => <SearchOutlined />,
                            }}
                        >
                        </FInput>
                    </div>
                    <FScrollbar class="letgo-comp-tree__body" contentStyle={{ marginTop: '8px' }}>
                        <FTree
                            ref={refTree}
                            data={data.value}
                            selectedKeys={selectedIds.value}
                            onSelect={onSelectNode}
                            filterMethod={filterMethod}
                            defaultExpandAll
                            draggable
                            onDrop={onDrop}
                        />
                    </FScrollbar>
                </div>
            );
        };
    },
});
