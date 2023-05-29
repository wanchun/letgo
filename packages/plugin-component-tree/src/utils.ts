import type { INode } from '@webank/letgo-designer';
import type { VNodeChild } from 'vue';

interface Option {
    value: string
    label: string
    children?: Option[]
    prefix?: () => VNodeChild
    suffix?: () => VNodeChild
}

export function transformNode(node: INode): Option {
    const option: Option = {
        value: node.id,
        label: node.componentName || node.title,
    };
    const childNodeList: INode[] = [...node.slots, ...node.children.getNodes()];
    option.children = childNodeList.map(transformNode);

    return option;
}
