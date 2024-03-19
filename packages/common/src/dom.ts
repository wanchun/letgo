export function getOffset(el: HTMLElement | null) {
    if (el) {
        const rect = el.getBoundingClientRect();

        return {
            top: rect.top + (document.documentElement.scrollTop || document.body.scrollTop || 0),
            left: rect.left + (document.documentElement.scrollLeft || document.body.scrollLeft || 0),
        };
    }

    return {
        top: 'auto',
        left: 'auto',
    };
}

export function getOuterWidth(el: HTMLElement, margin?: string) {
    if (el != null) {
        let width = el.offsetWidth;

        if (margin) {
            const style = getComputedStyle(el);

            width += Number.parseFloat(style.marginLeft) + Number.parseFloat(style.marginRight);
        }

        return width;
    }

    return 0;
}

export function getViewport() {
    const win = window;
    const d = document;
    const e = d.documentElement;
    const g = d.getElementsByTagName('body')[0];
    const w = win.innerWidth || e.clientWidth || g.clientWidth;
    const h = win.innerHeight || e.clientHeight || g.clientHeight;

    return { width: w, height: h };
}

export function getHiddenElementOuterWidth(element: HTMLElement) {
    if (element) {
        element.style.visibility = 'hidden';
        element.style.display = 'block';
        const elementWidth = element.offsetWidth;

        element.style.display = 'none';
        element.style.visibility = 'visible';

        return elementWidth;
    }

    return 0;
}

export function focus(el: HTMLElement) {
    el && document.activeElement !== el && el.focus();
}

export function findSingle(element: Element, selector: string) {
    if (element instanceof HTMLElement)
        return element.querySelector(selector);

    return null;
}

export function getHiddenElementOuterHeight(element: HTMLElement) {
    if (element) {
        element.style.visibility = 'hidden';
        element.style.display = 'block';
        const elementHeight = element.offsetHeight;

        element.style.display = 'none';
        element.style.visibility = 'visible';

        return elementHeight;
    }

    return 0;
}

export function addStyles(element: HTMLElement, styles: Record<string, string> = {}) {
    if (element)
        Object.assign(element.style, styles);
}

let calculatedScrollbarWidth: number;
export function calculateScrollbarWidth() {
    if (calculatedScrollbarWidth != null)
        return calculatedScrollbarWidth;

    const scrollDiv = document.createElement('div');

    addStyles(scrollDiv, {
        width: '100px',
        height: '100px',
        overflow: 'scroll',
        position: 'absolute',
        top: '-9999px',
    });
    document.body.appendChild(scrollDiv);

    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;

    document.body.removeChild(scrollDiv);

    calculatedScrollbarWidth = scrollbarWidth;

    return scrollbarWidth;
}

export function nestedPosition(element: HTMLElement, level: number) {
    if (element) {
        const parentItem = element.parentElement!;
        const elementOffset = getOffset(parentItem);
        const viewport = getViewport();
        const subListWidth = element.offsetParent ? element.offsetWidth : getHiddenElementOuterWidth(element);
        const itemOuterWidth = getOuterWidth(parentItem.children[0] as HTMLElement);
        let left;
        if (typeof elementOffset.left === 'number') {
            if (elementOffset.left + itemOuterWidth + subListWidth > viewport.width - calculateScrollbarWidth()) {
                if (elementOffset.left < subListWidth) {
                    // for too small screens
                    if (level % 2 === 1)
                        left = elementOffset.left ? `-${elementOffset.left}px` : '100%';
                    else if (level % 2 === 0)
                        left = `${viewport.width - subListWidth - calculateScrollbarWidth()}px`;
                }
                else {
                    left = '-100%';
                }
            }
        }

        element.style.top = '0px';
        element.style.left = left || '100%';
    }
}
