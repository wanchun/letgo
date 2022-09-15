import { EventEmitter } from 'events';
import { NodeSchema } from '@webank/letgo-types';
import { DocumentModel } from '../document';
import { Node } from '../node';
import { ISensor } from '../types';
import { Designer } from './designer';

export enum DragObjectType {
    Node = 'node',
    NodeData = 'nodeData',
}

export interface DragNodeObject {
    type: DragObjectType.Node;
    nodes: Node[];
}

export interface DragNodeDataObject {
    type: DragObjectType.NodeData;
    data: NodeSchema | NodeSchema[];
    thumbnail?: string;
    description?: string;
    [extra: string]: any;
}

export interface DragAnyObject {
    type: string;
    [key: string]: any;
}

export type DragObject = DragNodeObject | DragNodeDataObject | DragAnyObject;

export function isDragNodeObject(obj: any): obj is DragNodeObject {
    return obj && obj.type === DragObjectType.Node;
}

export function isDragNodeDataObject(obj: any): obj is DragNodeDataObject {
    return obj && obj.type === DragObjectType.NodeData;
}

export function isDragAnyObject(obj: any): obj is DragAnyObject {
    return (
        obj &&
        obj.type !== DragObjectType.NodeData &&
        obj.type !== DragObjectType.Node
    );
}

export interface LocateEvent {
    readonly type: 'LocateEvent';
    /**
     * 浏览器窗口坐标系
     */
    readonly globalX: number;
    readonly globalY: number;
    /**
     * 原始事件
     */
    readonly originalEvent: MouseEvent | DragEvent;
    /**
     * 拖拽对象
     */
    readonly dragObject: DragObject;

    /**
     * 激活的感应器
     */
    sensor?: ISensor;

    // ======= 以下是 激活的 sensor 将填充的值 ========
    /**
     * 浏览器事件响应目标
     */
    target?: Element | null;
    /**
     * 当前激活文档画布坐标系
     */
    canvasX?: number;
    canvasY?: number;
    /**
     * 激活或目标文档
     */
    document?: DocumentModel;
    /**
     * 事件订正标识，初始构造时，从发起端构造，缺少 canvasX,canvasY, 需要经过订正才有
     */
    fixed?: true;
}

const SHAKE_DISTANCE = 4;
/**
 * mouse shake check
 */
export function isShaken(
    e1: MouseEvent | DragEvent,
    e2: MouseEvent | DragEvent,
): boolean {
    if ((e1 as any).shaken) {
        return true;
    }
    if (e1.target !== e2.target) {
        return true;
    }
    return (
        Math.pow(e1.clientY - e2.clientY, 2) +
            Math.pow(e1.clientX - e2.clientX, 2) >
        SHAKE_DISTANCE
    );
}

export function setShaken(e: any) {
    e.shaken = true;
}

export function isInvalidPoint(e: any, last: any): boolean {
    return (
        e.clientX === 0 &&
        e.clientY === 0 &&
        last &&
        (Math.abs(last.clientX - e.clientX) > 5 ||
            Math.abs(last.clientY - e.clientY) > 5)
    );
}

/**
 * Drag-on 拖拽引擎
 */
export class Dragon {
    private emitter = new EventEmitter();

    private sensors: ISensor[] = [];

    /**
     * 当前激活的 Sensor, 可用于感应区高亮
     */
    private _activeSensor: ISensor | undefined;

    private _dragging = false;

    private _canDrop = false;

    get activeSensor(): ISensor | undefined {
        return this._activeSensor;
    }

    get dragging(): boolean {
        return this._dragging;
    }

    constructor(readonly designer: Designer) {}

    /**
     * Quick listen a shell(container element) drag behavior
     * @param shell container element
     * @param boost boost got a drag object
     */
    from(shell: Element, boost: (e: MouseEvent) => DragObject | null) {
        const mousedown = (e: MouseEvent) => {
            // ESC or RightClick
            if (e.which === 3 || e.button === 2) {
                return;
            }

            // Get a new node to be dragged
            const dragObject = boost(e);
            if (!dragObject) {
                return;
            }

            this.boost(dragObject, e);
        };
        shell.addEventListener('mousedown', mousedown as any);
        return () => {
            shell.removeEventListener('mousedown', mousedown as any);
        };
    }

    /**
     * boost your dragObject for dragging(flying) 发射拖拽对象
     *
     * @param dragObject 拖拽对象
     * @param boostEvent 拖拽初始时事件
     */
    boost(
        dragObject: DragObject,
        boostEvent: MouseEvent | DragEvent,
        fromRglNode?: Node,
    ) {
        const { designer } = this;
    }
}
