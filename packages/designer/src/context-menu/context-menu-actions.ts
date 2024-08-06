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

    purge: () => void;
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

export class ContextMenuActions implements IContextMenuActions {
    actions: IPublicTypeContextMenuAction[] = [];

    designer: Designer;

    dispose: Function[];
    listeners: Function[] = [];

    enableContextMenu: boolean;

    id: string = uniqueId('contextMenu');

    constructor(designer: Designer) {
        this.designer = designer;
        this.dispose = [];
        this.listeners.push(engineConfig.onGot('enableContextMenu', (enable: boolean) => {
            if (this.enableContextMenu === enable)
                return;

            this.enableContextMenu = enable;
            this.dispose.forEach(d => d());
            this.dispose = [];
            if (enable)
                this.initEvent();
        }));
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

        createContextMenu(menus, event, [simulatorLeft, simulatorTop]);
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
        this.listeners.forEach(listener => listener());
        this.listeners = [];
        this.dispose.forEach(dispose => dispose());
        this.dispose = [];
    }
}
