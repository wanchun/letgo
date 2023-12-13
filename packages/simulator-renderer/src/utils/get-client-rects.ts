import { isElement } from '@webank/letgo-common';

// a range for test TextNode clientRect
const cycleRange = document.createRange();

export function getClientRects(node: Element | Text) {
    if (isElement(node))
        return [node.getBoundingClientRect()];

    cycleRange.selectNode(node);
    return Array.from(cycleRange.getClientRects());
}
