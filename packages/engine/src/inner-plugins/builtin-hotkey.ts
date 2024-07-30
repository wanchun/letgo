import { isFormEvent } from '@webank/letgo-common';
import type { INode } from '@webank/letgo-designer';
import { insertChildren } from '@webank/letgo-designer';
import {
    definePlugin,
} from '@webank/letgo-engine-plugin';
import type {
    IPluginContext,
} from '@webank/letgo-engine-plugin';
import type {
    IPublicTypeDragNodeObject,
} from '@webank/letgo-types';
import {
    IPublicEnumDragObject,
    IPublicEnumTransformStage,
} from '@webank/letgo-types';

import { getClipboardText } from './default-context-menu';

/**
 * 获得合适的插入位置
 */
function getSuitableInsertion(
    pluginContext: IPluginContext,
    insertNode?: INode[],
): { target: INode; index?: number } | null {
    const { project } = pluginContext;
    const activeDoc = project.currentDocument;
    if (!activeDoc)
        return null;

    if (
        Array.isArray(insertNode)
        && insertNode[0].isModal()
    ) {
        if (!activeDoc.root)
            return null;

        return {
            target: activeDoc.root,
        };
    }

    const focusNode = activeDoc.focusNode!;
    const nodes = activeDoc.selection.getNodes();
    const refNode = nodes.find(item => focusNode.contains(item));
    let target;
    let index: number | undefined;
    if (!refNode || refNode === focusNode) {
        target = focusNode;
    }
    else if (refNode.componentMeta?.isContainer) {
        target = refNode;
    }
    else {
    // FIXME!!, parent maybe null
        target = refNode.parent!;
        index = refNode.index + 1;
    }

    if (target && insertNode && !target.componentMeta?.checkNestingDown(target, insertNode[0]))
        return null;

    return { target, index };
}

/* istanbul ignore next */
function getNextForSelect(next: INode | null, head?: any, parent?: INode | null): any {
    if (next) {
        if (!head)
            return next;

        let ret;
        if (next.isContainerNode) {
            const { children } = next;
            if (children && !children.isEmpty()) {
                ret = getNextForSelect(children.get(0));
                if (ret)
                    return ret;
            }
        }

        ret = getNextForSelect(next.nextSibling);
        if (ret)
            return ret;
    }

    if (parent)
        return getNextForSelect(parent.nextSibling, false, parent?.parent);

    return null;
}

/* istanbul ignore next */
function getPrevForSelect(prev: INode | null, head?: any, parent?: INode | null): any {
    if (prev) {
        let ret;
        if (!head && prev.isContainerNode) {
            const { children } = prev;
            const lastChild = children && !children.isEmpty() ? children.get(children.size - 1) : null;

            ret = getPrevForSelect(lastChild);
            if (ret)
                return ret;
        }

        if (!head)
            return prev;

        ret = getPrevForSelect(prev.prevSibling);
        if (ret)
            return ret;
    }

    if (parent)
        return parent;

    return null;
}

function getSuitablePlaceForNode(targetNode: INode, node: INode, ref: any): any {
    const { document } = targetNode;
    if (!document)
        return null;

    const dragNodeObject: IPublicTypeDragNodeObject<INode> = {
        type: IPublicEnumDragObject.Node,
        nodes: [node],
    };

    const focusNode = document?.focusNode;
    // 如果节点是模态框，插入到根节点下
    if (node?.componentMeta?.isModal)
        return { container: focusNode, ref };

    if (!ref && focusNode && targetNode.contains(focusNode)) {
        if (document.checkNesting(focusNode, dragNodeObject))
            return { container: focusNode };

        return null;
    }

    if (targetNode.isRoot() && Array.isArray(targetNode.children)) {
        const dropElement = targetNode.children.filter((c) => {
            if (!c.isContainerNode)
                return false;

            if (document.checkNesting(c, dragNodeObject))
                return true;

            return false;
        })[0];

        if (dropElement)
            return { container: dropElement, ref };

        if (document.checkNesting(targetNode, dragNodeObject))
            return { container: targetNode, ref };

        return null;
    }

    if (targetNode.isContainerNode) {
        if (document.checkNesting(targetNode, dragNodeObject))
            return { container: targetNode, ref };
    }

    if (targetNode.parent)
        return getSuitablePlaceForNode(targetNode.parent, node, { index: targetNode.index });

    return null;
}

export const BuiltinHotkey = definePlugin({
    name: '___builtin_hotkey___',
    init(ctx) {
        const { hotkey, project, logger, skeleton, canvas } = ctx;
        const { clipboard } = canvas;

        // hotkey binding
        hotkey.bind(['backspace', 'del'], (e: KeyboardEvent) => {
            if (canvas.isInLiveEditing)
                return;

            const doc = project.currentDocument;
            if (isFormEvent(e) || !doc)
                return;

            e.preventDefault();

            const sel = doc.selection;
            const topItems = sel.getTopNodes();
            topItems.forEach((node) => {
                if (node?.canPerformAction('remove'))
                    node.remove();
            });
            sel.clear();
        });

        // command + c copy  command + x cut
        hotkey.bind(['command+c', 'ctrl+c', 'command+x', 'ctrl+x'], (e, action) => {
            logger.info(`action ${action} is triggered`);
            if (canvas.isInLiveEditing)
                return;

            const doc = project.currentDocument;
            if (isFormEvent(e) || !doc)
                return;

            const anchorValue = document.getSelection()?.anchorNode?.nodeValue;
            if (anchorValue && typeof anchorValue === 'string')
                return;

            e.preventDefault();

            let selected = doc.selection.getTopNodes(true);
            selected = selected.filter((node) => {
                return node?.canPerformAction('copy');
            });
            if (!selected || selected.length < 1)
                return;

            const componentsMap = {};
            const componentsTree = selected.map(item => item?.exportSchema(IPublicEnumTransformStage.Clone));

            // FIXME: clear node.id

            const data = { type: 'nodeSchema', componentsMap, componentsTree };

            clipboard.setData(data);

            const cutMode = action && action.indexOf('x') > 0;
            if (cutMode) {
                selected.forEach((node) => {
                    const parentNode = node?.parent;
                    parentNode?.select();
                    node?.remove();
                });
            }
        });

        // command + v paste
        hotkey.bind(['command+v', 'ctrl+v'], async (e, action) => {
            logger.info(`action ${action} is triggered`);
            if (canvas.isInLiveEditing)
                return;

            const doc = project?.currentDocument;
            if (isFormEvent(e) || !doc)
                return;

            const copyData = await getClipboardText(clipboard);
            const { componentsTree } = copyData;
            if (componentsTree) {
                let nodes = componentsTree.map((item) => {
                    return doc.createNode(item);
                });
                const { target, index } = getSuitableInsertion(ctx, nodes) || {};
                if (!target)
                    return;

                const canAddComponentsTree = nodes.filter((node) => {
                    const dragNodeObject: IPublicTypeDragNodeObject<INode> = {
                        type: IPublicEnumDragObject.Node,
                        nodes: [node],
                    };
                    return doc.checkNesting(target, dragNodeObject);
                });
                if (canAddComponentsTree.length === 0)
                    return;

                nodes = insertChildren(target, canAddComponentsTree, index);
                if (nodes)
                    doc.selection.selectAll(nodes.map(o => o.id));
            }
        });

        // command + z undo
        hotkey.bind(['command+z', 'ctrl+z'], (e, action) => {
            logger.info(`action ${action} is triggered`);
            if (canvas.isInLiveEditing)
                return;

            const history = project.currentDocument?.history;
            if (isFormEvent(e) || !history)
                return;

            e.preventDefault();
            const selection = project.currentDocument?.selection;
            const curSelected = selection?.selected && Array.from(selection?.selected);
            history.back();
            selection?.selectAll(curSelected);
        });

        // command + shift + z redo
        hotkey.bind(['command+y', 'ctrl+y', 'command+shift+z'], (e, action) => {
            logger.info(`action ${action} is triggered`);
            if (canvas.isInLiveEditing)
                return;

            const history = project.currentDocument?.history;
            if (isFormEvent(e) || !history)
                return;

            e.preventDefault();
            const selection = project.currentDocument?.selection;
            const curSelected = selection?.selected && Array.from(selection?.selected);
            history.forward();
            selection?.selectAll(curSelected);
        });

        let prePanel: any;
        hotkey.bind(['command+b', 'ctrl+b'], (e, action) => {
            logger.info(`action ${action} is triggered`);
            if (canvas.isInLiveEditing)
                return;

            const history = project.currentDocument?.history;
            if (isFormEvent(e) || !history)
                return;

            e.preventDefault();

            const currentItem = skeleton.leftFloatArea.current || prePanel || skeleton.leftFloatArea.items[0];
            prePanel = currentItem;
            prePanel?.toggle();
        });

        hotkey.bind(['command+shift+d'], (e, action) => {
            logger.info(`action ${action} is triggered`);
            if (canvas.isInLiveEditing)
                return;

            const history = project.currentDocument?.history;
            if (isFormEvent(e) || !history)
                return;

            e.preventDefault();

            const currentItem = skeleton.leftFloatArea.items.find(item => item.name === 'PluginComponentTreePanel');
            if (currentItem)
                currentItem.toggle();
        });

        hotkey.bind(['command+shift+e'], (e, action) => {
            logger.info(`action ${action} is triggered`);
            if (canvas.isInLiveEditing)
                return;

            const history = project.currentDocument?.history;
            if (isFormEvent(e) || !history)
                return;

            e.preventDefault();

            const currentItem = skeleton.leftFloatArea.items.find(item => item.name === 'CodePanel');
            if (currentItem)
                currentItem.toggle();
        });

        // sibling selection
        hotkey.bind(['left', 'right'], (e, action) => {
            logger.info(`action ${action} is triggered`);
            if (canvas.isInLiveEditing)
                return;

            const doc = project.currentDocument;
            if (isFormEvent(e) || !doc)
                return;

            e.preventDefault();
            const selected = doc.selection.getTopNodes(true);
            if (!selected || selected.length < 1)
                return;

            const firstNode = selected[0];
            const sibling = action === 'left' ? firstNode?.prevSibling : firstNode?.nextSibling;
            sibling?.select();
        });

        hotkey.bind(['up', 'down'], (e, action) => {
            logger.info(`action ${action} is triggered`);
            if (canvas.isInLiveEditing)
                return;

            const doc = project.currentDocument;
            if (isFormEvent(e) || !doc)
                return;

            e.preventDefault();
            const selected = doc.selection.getTopNodes(true);
            if (!selected || selected.length < 1)
                return;

            const firstNode = selected[0];

            if (action === 'down') {
                const next = getNextForSelect(firstNode, true, firstNode?.parent);
                next?.select();
            }
            else if (action === 'up') {
                const prev = getPrevForSelect(firstNode, true, firstNode?.parent);
                prev?.select();
            }
        });

        hotkey.bind(['option+left', 'option+right'], (e, action) => {
            logger.info(`action ${action} is triggered`);
            if (canvas.isInLiveEditing)
                return;

            const doc = project.currentDocument;
            if (isFormEvent(e) || !doc)
                return;

            e.preventDefault();
            const selected = doc.selection.getTopNodes(true);
            if (!selected || selected.length < 1)
                return;

            // TODO: 此处需要增加判断当前节点是否可被操作移动，原ve里是用 node.canOperating()来判断
            // TODO: 移动逻辑也需要重新梳理，对于移动目标位置的选择，是否可以移入，需要增加判断

            const firstNode = selected[0];
            const parent = firstNode?.parent;
            if (!parent)
                return;

            const isPrev = action && /(left)$/.test(action);

            const sibling = isPrev ? firstNode.prevSibling : firstNode.nextSibling;
            if (sibling) {
                if (isPrev)
                    parent.insertBefore(firstNode, sibling);
                else
                    parent.insertAfter(firstNode, sibling);

                firstNode?.select();
            }
        });

        hotkey.bind(['option+up'], (e, action) => {
            logger.info(`action ${action} is triggered`);
            if (canvas.isInLiveEditing)
                return;

            const doc = project.currentDocument;
            if (isFormEvent(e) || !doc)
                return;

            e.preventDefault();
            const selected = doc.selection.getTopNodes(true);
            if (!selected || selected.length < 1)
                return;

            // TODO: 此处需要增加判断当前节点是否可被操作移动，原ve里是用 node.canOperating()来判断
            // TODO: 移动逻辑也需要重新梳理，对于移动目标位置的选择，是否可以移入，需要增加判断

            const firstNode = selected[0];
            const parent = firstNode?.parent;
            if (!parent)
                return;

            const sibling = firstNode.prevSibling;
            if (sibling) {
                if (sibling.isContainerNode) {
                    const place = getSuitablePlaceForNode(sibling, firstNode, null);
                    sibling.insertAfter(firstNode, place.ref);
                }
                else {
                    parent.insertBefore(firstNode, sibling);
                }
                firstNode?.select();
            }
            else {
                const place = getSuitablePlaceForNode(parent, firstNode, null); // upwards
                if (place) {
                    place.container.insertBefore(firstNode, place.ref);
                    firstNode?.select();
                }
            }
        });

        hotkey.bind(['option+down'], (e, action) => {
            logger.info(`action ${action} is triggered`);
            if (canvas.isInLiveEditing)
                return;

            const doc = project.currentDocument;
            if (isFormEvent(e) || !doc)
                return;

            e.preventDefault();
            const selected = doc.selection.getTopNodes(true);
            if (!selected || selected.length < 1)
                return;

            // TODO: 此处需要增加判断当前节点是否可被操作移动，原 ve 里是用 node.canOperating() 来判断
            // TODO: 移动逻辑也需要重新梳理，对于移动目标位置的选择，是否可以移入，需要增加判断

            const firstNode = selected[0];
            const parent = firstNode?.parent;
            if (!parent)
                return;

            const sibling = firstNode.nextSibling;
            if (sibling) {
                if (sibling.isContainerNode)
                    sibling.insertBefore(firstNode, undefined);
                else
                    parent.insertAfter(firstNode, sibling);

                firstNode?.select();
            }
            else {
                const place = getSuitablePlaceForNode(parent, firstNode, null); // upwards
                if (place) {
                    place.container.insertAfter(firstNode, place.ref, true);
                    firstNode?.select();
                }
            }
        });
    },
    destroy() {},
});
