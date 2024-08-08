import { type IPublicApiMaterial, IPublicEnumContextMenuType, type IPublicModelNode, type IPublicTypeContextMenuAction } from '@webank/letgo-types';
import { uniqueId } from '@webank/letgo-common';
import { engineConfig } from '@webank/letgo-editor-core';
import type { INode } from '../node';
import type { Designer } from '../designer';
import { createContextMenu, parseContextMenuProperties } from './context-menu';

export interface IContextMenuActions {
    actions: IPublicTypeContextMenuAction[];

    addMenuAction: IPublicApiMaterial['addContextMenuOption'];

    removeMenuAction: IPublicApiMaterial['removeContextMenuOption'];

    setup: () => void;

    purge: () => void;
}

export class ContextMenuActions implements IContextMenuActions {
    readonly designer: Designer;

    readonly id: string = uniqueId('contextMenu');

    actions: IPublicTypeContextMenuAction[] = [];

    dispose: Function[] = [];

    enableContextMenu: boolean;

    constructor(designer: Designer) {
        this.designer = designer;
    }

    setup() {
        this.dispose.push(
            engineConfig.onGot('enableContextMenu', (enable: boolean) => {
                this.enableContextMenu = enable;
                if (enable)
                    this.initEvent();
            }),
        );
    }

    handleContextMenu = (
        nodes: IPublicModelNode[],
        event: MouseEvent,
    ) => {
        const designer = this.designer;
        event.stopPropagation();
        event.preventDefault();

        const { bounds } = designer.simulator?.viewport || { bounds: { left: 0, top: 0 } };
        const { left: simulatorLeft, top: simulatorTop } = bounds;

        const actions = designer.contextMenuActions.actions;

        const menus = parseContextMenuProperties(actions, {
            nodes,
            event,
        });

        if (!menus.length)
            return;

        const { destroy } = createContextMenu(menus, event, [simulatorLeft, simulatorTop]);
        this.dispose.push(destroy);
    };

    initEvent() {
        const designer = this.designer;

        this.dispose.push(
            designer.editor.onEvent('designer.builtinSimulator.contextmenu', ({
                node,
                originalEvent,
            }: {
                node?: INode;
                originalEvent: MouseEvent;
            }) => {
                originalEvent.stopPropagation();
                originalEvent.preventDefault();

                if (!node)
                    node = designer.currentDocument.root;

                // 如果右键的节点不在 当前选中的节点中，选中该节点
                if (!designer.currentSelection.has(node.id))
                    designer.currentSelection.select(node.id);

                const nodes = designer.currentSelection.getNodes();
                this.handleContextMenu(nodes as unknown as IPublicModelNode[], originalEvent);
            }),
        );
    }

    addMenuAction(action: IPublicTypeContextMenuAction) {
        this.actions.push({
            type: IPublicEnumContextMenuType.MENU_ITEM,
            ...action,
        });
    }

    removeMenuAction(name: string) {
        const i = this.actions.findIndex(action => action.name === name);
        if (i > -1)
            this.actions.splice(i, 1);
    }

    purge() {
        this.dispose.forEach(dispose => dispose());
        this.dispose = [];
        this.actions = [];
    }
}
