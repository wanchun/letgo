import { render } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import type { IPublicModelNode, IPublicTypeContextMenuAction } from '@webank/letgo-types';
import { IPublicEnumContextMenuType } from '@webank/letgo-types';
import { Logger } from '@webank/letgo-common';
import ContextMenu from 'primevue/contextmenu';
import type { ContextMenuProps } from 'primevue/contextmenu';

const logger = new Logger({ level: 'warn', bizName: 'utils' });

const MAX_LEVEL = 2;

type MenuItem = ContextMenuProps['model'][number];

interface IOptions {
    nodes?: IPublicModelNode[] | null;
    destroy?: Function;
}

export function parseContextMenuProperties(menus: (IPublicTypeContextMenuAction | Omit<IPublicTypeContextMenuAction, 'items'>)[], options: IOptions & {
    event?: MouseEvent;
}, level = 1): MenuItem[] {
    const { nodes, destroy } = options;
    if (level > MAX_LEVEL) {
        logger.warn('context menu level is too deep, please check your context menu config');
        return [];
    }

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
                command: () => {
                    destroy?.();
                    menu.action?.(nodes || [], options.event);
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
export function createContextMenu(items: MenuItem[], event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (!container)
        container = document.createElement('div');

    function getRef(inst: Element | ComponentPublicInstance) {
        (inst as any).show(event);
    }

    function destroy() {
        render(null, container);
    }

    render(<ContextMenu ref={getRef} model={items} />, container);

    return {
        destroy,
    };
}
