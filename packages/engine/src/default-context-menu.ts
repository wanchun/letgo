import type {
    IPublicModelNode,
    IPublicTypeDragNodeDataObject,
    IPublicTypeNodeSchema,
} from '@webank/letgo-types';
import {
    IPublicEnumContextMenuType,
    IPublicEnumDragObject,
    IPublicEnumTransformStage,
} from '@webank/letgo-types';
import type {
    IPluginContext,
} from '@webank/letgo-engine-plugin';
import { FMessage } from '@fesjs/fes-design';
import { isProjectSchema } from '@webank/letgo-common';

function getNodesSchema(nodes: IPublicModelNode[]) {
    const componentsTree = nodes.map(node => node?.exportSchema(IPublicEnumTransformStage.Clone));
    const data = { type: 'nodeSchema', componentsMap: {}, componentsTree };
    return data;
}

async function getClipboardText(): Promise<IPublicTypeNodeSchema[]> {
    return new Promise((resolve, reject) => {
    // 使用 Clipboard API 读取剪贴板内容
        navigator.clipboard.readText().then(
            (text) => {
                try {
                    const data = JSON.parse(text);
                    if (isProjectSchema(data)) {
                        resolve(data.componentsTree);
                    }
                    else {
                        FMessage.error('不是有效的节点数据');
                        reject(
                            new Error('不是有效的节点数据'),
                        );
                    }
                }
                catch (error) {
                    FMessage.error('不是有效的节点数据');
                    reject(error);
                }
            },
            (err) => {
                reject(err);
            },
        );
    });
}

export function defaultContextMenu(ctx: IPluginContext) {
    const { material, canvas } = ctx;
    const { clipboard } = canvas;

    return {
        init() {
            material.addContextMenuOption({
                name: 'selectComponent',
                title: '选择组件',
                condition: (nodes = []) => {
                    return nodes.length === 1;
                },
                items: [
                    {
                        name: 'nodeTree',
                        type: IPublicEnumContextMenuType.NODE_TREE,
                    },
                ],
            });

            material.addContextMenuOption({
                name: 'copy',
                title: '拷贝',
                condition(nodes = []) {
                    return nodes?.length > 0;
                },
                action(nodes) {
                    if (!nodes || nodes.length < 1)
                        return;

                    const data = getNodesSchema(nodes);
                    clipboard.setData(data);
                },
            });

            material.addContextMenuOption({
                name: 'pasteToInner',
                title: '粘贴至内部',
                condition: (nodes) => {
                    return nodes?.length === 1;
                },
                disabled: (nodes = []) => {
                    // 获取粘贴数据
                    const node = nodes?.[0];
                    return !node.isContainerNode;
                },
                async action(nodes) {
                    const node = nodes?.[0];
                    if (!node)
                        return;

                    const { document: doc } = node;

                    try {
                        const nodeSchema = await getClipboardText();
                        const index = node.children?.size || 0;
                        if (nodeSchema.length === 0)
                            return;

                        const canAddNodes = nodeSchema.filter((nodeSchema: IPublicTypeNodeSchema) => {
                            const dragNodeObject: IPublicTypeDragNodeDataObject = {
                                type: IPublicEnumDragObject.NodeData,
                                data: nodeSchema,
                            };
                            return doc?.checkNesting(node, dragNodeObject);
                        });
                        if (canAddNodes.length === 0) {
                            FMessage.error(`${nodeSchema.map(d => d.title || d.componentName).join(',')}等组件无法放置到${node.title || node.componentName}内`);
                            return;
                        }

                        const nodes: IPublicModelNode[] = [];
                        nodeSchema.forEach((schema, schemaIndex) => {
                            const newNode = doc?.insertNode(node, schema, (index ?? 0) + 1 + schemaIndex, true);
                            newNode && nodes.push(newNode);
                        });
                        doc?.selection.selectAll(nodes.map(node => node?.id));
                    }
                    catch (error) {
                        console.error(error);
                    }
                },
            });

            material.addContextMenuOption({
                name: 'delete',
                title: '删除',
                condition(nodes = []) {
                    return nodes.length > 0;
                },
                action(nodes) {
                    nodes?.forEach((node) => {
                        node.remove();
                    });
                },
            });
        },
    };
}

defaultContextMenu.pluginName = '___default_context_menu___';
