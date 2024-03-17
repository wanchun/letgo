export interface MenuItemCommandEvent {
    /**
     * Browser event.
     */
    originalEvent: Event;
    /**
     * Menuitem instance.
     */
    item: MenuItem;
    /**
     * Optional
     */
    [key: string]: any;
}

export interface MenuItem {
    /**
     * Property name or getter function to use as the label of an item.
     */
    label?: string | ((...args: any) => string) | undefined;
    /**
     * Icon of the item.
     */
    icon?: string | undefined;
    /**
     * Callback to execute when item is clicked.
     * @param {MenuItemCommandEvent} event - Custom command event.
     * @todo next release should be able to change
     */
    command?: (event: MenuItemCommandEvent) => void;
    /**
     * External link to navigate when item is clicked.
     */
    url?: string | undefined;
    /**
     * 	An array of children menuitems.
     */
    items?: MenuItem[] | undefined;
    /**
     * A boolean or a function to return a boolean to specify if the item is disabled.
     * @defaultValue false
     */
    disabled?: boolean | ((...args: any) => boolean) | undefined;
    /**
     * A boolean or a function to return a boolean to specify if the item is visible.
     * @defaultValue true
     */
    visible?: boolean | ((...args: any) => boolean) | undefined;
    /**
     * Specifies where to open the linked document.
     */
    target?: string | undefined;
    /**
     * Defines the item as a separator.
     * @defaultValue false
     */
    separator?: boolean | undefined;
    /**
     * Inline style of the menuitem.
     */
    style?: any;
    /**
     * Optional
     */
    [key: string]: any;
}

export interface InnerMenuItem {
    item: MenuItem;
    items?: InnerMenuItem[];
    index: number;
    level: number;
    key: string;
    parent?: InnerMenuItem;
    parentKey?: string;
}
