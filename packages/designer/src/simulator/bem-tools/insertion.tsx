import type { CSSProperties, PropType } from 'vue';
import { defineComponent } from 'vue';
import type { Simulator } from '../simulator';
import { isLocationChildrenDetail, isVertical } from '../../designer';
import type { DropLocation, ILocationChildrenDetail, IRect } from '../../designer';
import type { INode, ISimulator } from '../../types';
import { coverCls, verticalCls, wrapCls } from './insertion.css';

interface InsertionData {
    edge?: DOMRect
    insertType?: string
    vertical?: boolean
    nearRect?: IRect
    coverRect?: DOMRect
    nearNode?: INode
}

/**
 * 处理拖拽子节点(INode)情况
 */
function processChildrenDetail(sim: ISimulator, container: INode, detail: ILocationChildrenDetail): InsertionData {
    let edge = detail.edge || null;

    if (!edge) {
        edge = sim.computeRect(container);
        if (!edge)
            return {};
    }

    const ret: InsertionData = {
        edge,
        insertType: 'before',
    };

    if (detail.near) {
        const { node, pos, rect, align } = detail.near;
        ret.nearRect = rect || sim.computeRect(node);
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

    if (isLocationChildrenDetail(detail)) {
        return processChildrenDetail(sim, target, detail);
    }
    else {
        // TODO: others...
        const instances = sim.getComponentInstances(target);
        if (!instances)
            return {};

        const edge = sim.computeComponentInstanceRect(instances[0], target.componentMeta.rootSelector);
        return edge ? { edge, insertType: 'cover', coverRect: edge } : {};
    }
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
            const { edge, insertType, coverRect, nearRect, vertical } = processDetail(loc);

            if (!edge)
                return null;

            const className = [wrapCls];

            const style: CSSProperties = {};
            let x: number;
            let y: number;
            if (insertType === 'cover') {
                className.push(coverCls);
                x = (coverRect!.left + scrollX) * scale;
                y = (coverRect!.top + scrollY) * scale;
                style.width = `${coverRect!.width * scale}px`;
                style.height = `${coverRect!.height * scale}px`;
            }
            else {
                if (!nearRect)
                    return null;

                if (vertical) {
                    className.push(verticalCls);
                    x = ((insertType === 'before' ? nearRect.left : nearRect.right) + scrollX) * scale;
                    y = (nearRect.top + scrollY) * scale;
                    style.height = `${nearRect!.height * scale}px`;
                }
                else {
                    x = (nearRect.left + scrollX) * scale;
                    y = ((insertType === 'before' ? nearRect.top : nearRect.bottom) + scrollY) * scale;
                    style.width = `${nearRect.width * scale}px`;
                }
            }
            style.transform = `translate3d(${x}px, ${y}px, 0)`;

            return <div class={className} style={style} />;
        };
    },
});
