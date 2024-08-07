import type {
    ICodeStruct,
    IPublicModelClipboard,
    IPublicModelNode,
    IPublicTypeDragNodeDataObject,
    IPublicTypeNodeSchema,
} from '@webank/letgo-types';
import {
    IPublicEnumContextMenuType,
    IPublicEnumDragObject,
    IPublicEnumTransformStage,
} from '@webank/letgo-types';
import { definePlugin } from '@webank/letgo-engine-plugin';
import { FMessage } from '@fesjs/fes-design';
import { collectLogicFromIds, findSchemaLogic, genCodeMap, isProjectSchema, sortState } from '@webank/letgo-common';

interface CopyType {
    type: string;
    code: ICodeStruct;
    componentsTree: IPublicTypeNodeSchema[];
}

function getNodesSchema(nodes: IPublicModelNode[]) {
    const componentsTree = nodes.map(node => node?.exportSchema(IPublicEnumTransformStage.Clone));
    const codes = Array.from(new Set(componentsTree.map(item => findSchemaLogic(item)).flat()));
    const [codeStruct, unMatchIds] = collectLogicFromIds(codes, nodes[0].document);
    if (unMatchIds.size > 0)
        FMessage.warn(`剪贴板内容中的含有非逻辑变量依赖：${Array.from(unMatchIds).join(', ')}`);

    const data = { type: 'nodeSchema', code: codeStruct, componentsMap: {}, componentsTree };
    return data;
}

export async function getClipboardText(clipboard: IPublicModelClipboard): Promise<CopyType> {
    return new Promise((resolve, reject) => {
    // 使用 Clipboard API 读取剪贴板内容
        clipboard.getData().then(
            (text) => {
                try {
                    const data = JSON.parse(text) as CopyType;
                    if (isProjectSchema(data)) {
                        resolve(data);
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

export const DefaultContextMenu = definePlugin({
    name: '___default_context_menu___',
    init(ctx) {
        const { material, canvas } = ctx;
        const { clipboard } = canvas;
        material.addContextMenuOption({
            name: 'selectParentComponent',
            title: '选择父级组件',
            condition: (nodes = []) => {
                return !!(nodes.length === 1 && nodes[0].parent);
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
            title: '拷贝(含逻辑)',
            condition(nodes = []) {
                return nodes?.length > 0 && !nodes[0].isRoot();
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
                    const copyData = await getClipboardText(clipboard);
                    const index = node.children?.size || 0;
                    const nodeSchema = copyData.componentsTree;
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

                    const codeMap = genCodeMap(copyData.code);
                    const sortResult = sortState(codeMap);
                    const hasId = (id: string) => {
                        return doc.code.hasCodeId(id) || doc.project.code.hasCodeId(id);
                    };
                    sortResult.forEach((codeId) => {
                        if (copyData.code.code.find(item => item.id === codeId)) {
                            if (!hasId(codeId))
                                doc.code.addCodeItem(codeMap.get(codeId));
                        }
                        else {
                            for (const directory of copyData.code.directories) {
                                if (directory.code.some(item => item.id === codeId)) {
                                    if (!hasId(directory.id))
                                        doc.code.addDirectory(directory.id);

                                    if (!hasId(codeId))
                                        doc.code.addCodeItemInDirectory(directory.id, codeMap.get(codeId));
                                }
                            }
                        }
                    });

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
            style: '--letgo-context-menu-color: #f5222d',
            condition(nodes = []) {
                return nodes.length > 0 && nodes.some(node => !node.isRoot());
            },
            action(nodes) {
                nodes?.forEach((node) => {
                    if (node?.canPerformAction('remove'))
                        node.remove();
                });
            },
        });
    },
    destroy() {},
});
