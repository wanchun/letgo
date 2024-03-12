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
}

export class GlobalContextMenuActions {
    enableContextMenu: boolean;

    dispose: Function[];

    contextMenuActionsMap: Map<string, ContextMenuActions> = new Map();

    constructor() {
        this.dispose = [];

        engineConfig.onGot('enableContextMenu', (enable: boolean) => {
            if (this.enableContextMenu === enable)
                return;

            this.enableContextMenu = enable;
            this.dispose.forEach(d => d());
            if (enable)
                this.initEvent();
        });
    }

    handleContextMenu = (
        event: MouseEvent,
    ) => {
        event.stopPropagation();
        event.preventDefault();

        const actions: IPublicTypeContextMenuAction[] = [];
        this.contextMenuActionsMap.forEach((contextMenu) => {
            actions.push(...contextMenu.actions);
        });

        const menus = parseContextMenuProperties(actions, {
            nodes: [],
            event,
        });

        if (!menus.length)
            return;

        createContextMenu(menus, event);
    };

    initEvent() {
        this.dispose.push(
            (() => {
                const handleContextMenu = (e: MouseEvent) => {
                    this.handleContextMenu(e);
                };

                document.addEventListener('contextmenu', handleContextMenu);

                return () => {
                    document.removeEventListener('contextmenu', handleContextMenu);
                };
            })(),
        );
    }

    registerContextMenuActions(contextMenu: ContextMenuActions) {
        this.contextMenuActionsMap.set(contextMenu.id, contextMenu);
    }
}

const globalContextMenuActions = new GlobalContextMenuActions();

export class ContextMenuActions implements IContextMenuActions {
    actions: IPublicTypeContextMenuAction[] = [];

    designer: Designer;

    dispose: Function[];

    enableContextMenu: boolean;

    id: string = uniqueId('contextMenu'); ;

    constructor(designer: Designer) {
        this.designer = designer;
        this.dispose = [];

        engineConfig.onGot('enableContextMenu', (enable: boolean) => {
            if (this.enableContextMenu === enable)
                return;

            this.enableContextMenu = enable;
            this.dispose.forEach(d => d());
            if (enable)
                this.initEvent();
        });

        globalContextMenuActions.registerContextMenuActions(this);
    }

    handleContextMenu = (
        nodes: IPublicModelNode[],
        event: MouseEvent,
    ) => {
        const designer = this.designer;
        event.stopPropagation();
        event.preventDefault();

        const actions = designer.contextMenuActions.actions;

        const menus = parseContextMenuProperties(actions, {
            nodes,
            event,
        });

        if (!menus.length)
            return;

        createContextMenu(menus, event);
    };

    initEvent() {
        const designer = this.designer;

        this.dispose.push(
            designer.editor.onEvent('designer.builtinSimulator.contextmenu', ({
                node,
                originalEvent,
            }: {
                node: INode;
                originalEvent: MouseEvent;
            }) => {
                originalEvent.stopPropagation();
                originalEvent.preventDefault();
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
}
