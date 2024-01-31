import type { CSSProperties, PropType } from 'vue';
import { defineComponent } from 'vue';
import { isLocationChildrenDetail } from '@webank/letgo-types';
import type {
    IPublicTypeLocationChildrenDetail,
    IPublicTypeRect,
} from '@webank/letgo-types';
import type { Simulator } from '../simulator';
import { isVertical } from '../../designer';
import type { DropLocation } from '../../designer';
import type { INode, ISimulator } from '../../types';
import './insertion.less';

interface InsertionData {
    edge?: DOMRect
    insertType?: string
    vertical?: boolean
    nearRect?: IPublicTypeRect
    coverRect?: DOMRect
    nearNode?: INode
}

/**
 * 处理拖拽子节点(INode)情况
 */
function processChildrenDetail(sim: ISimulator, container: INode, detail: IPublicTypeLocationChildrenDetail<INode>): InsertionData {
    let edge = detail.edge || null;

    if (!edge)
        edge = sim.computeRect(container);

    if (!edge)
        return {};

    const ret: InsertionData = {
        edge,
        insertType: 'before',
    };

    if (detail.near) {
        const { node, pos, align, rect } = detail.near;
        ret.nearRect = rect ?? sim.computeRect(node);
        ret.nearNode = node;
        if (pos === 'replace') {
            // FIXME: ret.nearRect mybe null
            ret.coverRect = ret.nearRect;
            ret.insertType = 'cover';
        }
        else if (!ret.nearRect || (ret.nearRect.width === 0 && ret.nearRect.height === 0)) {
            ret.nearRect = ret.edge;
            ret.insertType = 'after';
            ret.vertical = isVertical(ret.nearRect);
        }
        else {
            ret.insertType = pos;
            ret.vertical = align ? align === 'V' : isVertical(ret.nearRect);
        }
        return ret;
    }

    // from outline-tree: has index, but no near
    // TODO: think of shadowNode & ConditionFlow
    const { index } = detail;
    if (index == null) {
        ret.coverRect = ret.edge;
        ret.insertType = 'cover';
        return ret;
    }
    let nearNode = container.children.get(index);
    if (!nearNode) {
        // index = 0, eg. nochild,
        nearNode = container.children.get(index > 0 ? index - 1 : 0);
        if (!nearNode) {
            ret.insertType = 'cover';
            ret.coverRect = edge;
            return ret;
        }
        ret.insertType = 'after';
    }
    if (nearNode) {
        ret.nearRect = sim.computeRect(nearNode);
        if (!ret.nearRect || (ret.nearRect.width === 0 && ret.nearRect.height === 0)) {
            ret.nearRect = ret.edge;
            ret.insertType = 'after';
        }
        ret.vertical = isVertical(ret.nearRect);
        ret.nearNode = nearNode;
    }
    else {
        ret.insertType = 'cover';
        ret.coverRect = edge;
    }
    return ret;
}

/**
 * 将 detail 信息转换为页面"坐标"信息
 */
function processDetail({ target, detail, document }: DropLocation): InsertionData {
    const sim = document.simulator;
    if (!sim)
        return {};

    if (isLocationChildrenDetail<INode>(detail))
        return processChildrenDetail(sim, target, detail);

    const instances = sim.getComponentInstances(target);
    if (!instances)
        return {};

    const edge = sim.computeComponentInstanceRect(instances[0], target.componentMeta.rootSelector);
    return edge ? { edge, insertType: 'cover', coverRect: edge } : {};
}

export const InsertionView = defineComponent({
    name: 'InsertionView',
    props: {
        simulator: {
            type: Object as PropType<Simulator>,
        },
    },
    setup(props) {
        return () => {
            const { simulator } = props;
            const loc = simulator.designer.dropLocation;
            if (!loc)
                return null;

            const { scale, scrollX, scrollY } = simulator.viewport;
            const { edge, insertType, coverRect, nearRect, vertical, nearNode } = processDetail(loc);

            if (!edge)
                return null;

            const classNamePre = 'letgo-designer-sim__insertion';
            const className = [classNamePre];
            const style: CSSProperties = {};
            let x: number;
            let y: number;

            if (insertType === 'cover') {
                className.push(`${classNamePre}--cover`);
                x = (coverRect!.left + scrollX) * scale;
                y = (coverRect!.top + scrollY) * scale;
                style.width = `${coverRect!.width * scale}px`;
                style.height = `${coverRect!.height * scale}px`;
                style.transform = `translate3d(${x}px, ${y}px, 0)`;
                return (
                    <div class={className} style={style}></div>
                );
            }

            if (!nearRect)
                return null;

            x = (nearRect!.left + scrollX) * scale;
            y = (nearRect!.top + scrollY) * scale;
            style.width = `${nearRect!.width * scale}px`;
            style.height = `${nearRect!.height * scale}px`;
            style.transform = `translate3d(${x}px, ${y}px, 0)`;

            return (
                <div class={className} style={style}>
                    <div class={`${classNamePre}--${insertType}${vertical ? '--vertical' : ''}`}>
                        {nearNode.id}
                    </div>
                </div>
            );
        };
    },
});
