import { nextTick, render } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import type { IPublicModelNode, IPublicTypeContextMenuAction } from '@webank/letgo-types';
import { IPublicEnumContextMenuType } from '@webank/letgo-types';
import { Logger } from '@webank/letgo-common';
import { ContextMenuUI } from './context-menu-ui/context-menu';
import type { MenuItem } from './context-menu-ui/types';

const logger = new Logger({ level: 'warn', bizName: 'utils' });

const MAX_LEVEL = 2;

interface IOptions {
    nodes?: IPublicModelNode[] | null;
    destroy?: Function;
}

function nodeToMenuItem(node: IPublicModelNode, level = 0): MenuItem[] {
    const items: MenuItem[] = [];
    if (!node || level >= 7)
        return items;

    items.push({
        label: node.componentName,
        type: IPublicEnumContextMenuType.MENU_ITEM,
        command: () => {
            node.select();
        },
    });
    return items.concat(nodeToMenuItem(node.parent, level + 1));
}

export function parseContextMenuProperties(menus: (IPublicTypeContextMenuAction | Omit<IPublicTypeContextMenuAction, 'items'>)[], options: IOptions & {
    event?: MouseEvent;
}, level = 1): MenuItem[] {
    const { nodes, destroy } = options;
    if (level > MAX_LEVEL) {
        logger.warn('context menu level is too deep, please check your context menu config');
        return [];
    }

    if (menus.length === 1 && menus[0].type === IPublicEnumContextMenuType.NODE_TREE)
        return nodeToMenuItem(nodes[0].parent);

    return menus
        .filter(menu => !menu.condition || (menu.condition && menu.condition(nodes || [])))
        .map((menu) => {
            const {
                name,
                title,
                type = IPublicEnumContextMenuType.MENU_ITEM,
            } = menu;

            const result: MenuItem = {
                name,
                label: title,
                type,
                command: (params) => {
                    if (!params.item.disabled) {
                        destroy?.();
                        menu.action?.(nodes || [], options.event);
                    }
                },
                disabled: menu.disabled && menu.disabled(nodes || []) || false,
                separator: menu.separator,
            };

            if ('items' in menu && menu.items) {
                result.items = parseContextMenuProperties(
                    typeof menu.items === 'function' ? menu.items(nodes || []) : menu.items,
                    options,
                    level + 1,
                );
            }

            return result;
        })
        .reduce((menus: MenuItem[], currentMenu: MenuItem) => {
            if (!currentMenu.name)
                return menus.concat([currentMenu]);

            const index = menus.find(item => item.name === currentMenu.name);
            if (!index)
                return menus.concat([currentMenu]);
            else
                return menus;
        }, []);
}

let container: HTMLDivElement;
let showContextMenu: (event: MouseEvent) => void;
export function createContextMenu(items: MenuItem[], event: MouseEvent, offset?: [number, number]) {
    event.preventDefault();
    event.stopPropagation();

    if (!container)
        container = document.createElement('div');

    function getExpose({ show }: { show: (event: MouseEvent) => void }) {
        showContextMenu = show;
        showContextMenu(event);
    }

    function destroy() {
        render(null, container);
    }
    function renderContextMenu() {
        render(<ContextMenuUI getExpose={getExpose} offset={offset} model={items} />, container);
    }

    renderContextMenu();
    setTimeout(() => {
        showContextMenu && showContextMenu(event);
    });

    return {
        destroy,
    };
}
