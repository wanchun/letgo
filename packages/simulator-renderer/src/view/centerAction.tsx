import type { IPublicTypeComponentActionContent } from '@harrywan/letgo-types';
import {
    isActionContentObject,
} from '@harrywan/letgo-types';
import { createIcon } from '@harrywan/letgo-common';
import type { INode } from '@harrywan/letgo-designer';
import './center-action.less';

export function createAction(content: IPublicTypeComponentActionContent, key: string, node: INode) {
    if (typeof content === 'string')
        return content;

    if (typeof content === 'function')
        return content({ key, node });

    if (isActionContentObject(content)) {
        const { action, title, icon } = content;
        const handleClick = () => {
            if (action)
                action(node);
        };
        return (
            <div key={key} class="letgo-sim__action" onClick={handleClick}>
                {icon && createIcon(icon)}
                <span style="padding-left: 6px">{title}</span>
            </div>
        );
    }
    return null;
}
