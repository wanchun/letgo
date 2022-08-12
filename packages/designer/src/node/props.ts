import { uniqueId } from '@webank/letgo-utils';
import { Node } from './node';
import { Prop } from './prop';

export class Props {
    readonly id = uniqueId('props');

    private items: Prop[] = [];

    readonly owner: Node;

    /**
     * 元素个数
     */
    get size() {
        return this.items.length;
    }
}
