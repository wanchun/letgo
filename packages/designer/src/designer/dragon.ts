import { EventEmitter } from 'eventemitter3';
import { NodeSchema } from '@webank/letgo-types';
import { cursor } from '@webank/letgo-utils';
import { DocumentModel } from '../document';
import { Node } from '../node';
import { ISensor, ISimulator, isSimulator } from '../types';
import { makeEventsHandler } from '../utils';
import { Designer } from './designer';
import { DropLocation, LocationData } from './location';

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
    description?: string;
    [extra: string]: unknown;
}

export interface DragAnyObject {
    type: string;
    [key: string]: unknown;
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

export function isSameAs(
    e1: MouseEvent | DragEvent,
    e2: MouseEvent | DragEvent,
): boolean {
    return e1.clientY === e2.clientY && e1.clientX === e2.clientX;
}

function getSourceSensor(dragObject: DragObject): ISimulator | null {
    if (!isDragNodeObject(dragObject)) {
        return null;
    }
    return dragObject.nodes[0]?.document.simulator || null;
}

function isDragEvent(e: any): e is DragEvent {
    return e?.type?.startsWith('drag');
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
    boost(dragObject: DragObject, boostEvent: MouseEvent | DragEvent) {
        const { designer } = this;
        const handleEvents = makeEventsHandler(boostEvent, [
            designer.simulator,
        ]);
        const newBie = !isDragNodeObject(dragObject);
        const isFromDragAPI = isDragEvent(boostEvent);

        let lastSensor: ISensor | undefined;

        this._dragging = false;

        const sourceSensor = getSourceSensor(dragObject);

        let copy = false;
        const checkCopy = (e: MouseEvent | DragEvent | KeyboardEvent) => {
            /* istanbul ignore next */
            if (isDragEvent(e) && e.dataTransfer) {
                if (newBie) {
                    e.dataTransfer.dropEffect = 'copy';
                }
                return;
            }
            if (newBie) {
                return;
            }

            if (e.altKey || e.ctrlKey) {
                copy = true;
                this.setCopyState(true);
                /* istanbul ignore next */
                if (isDragEvent(e) && e.dataTransfer) {
                    e.dataTransfer.dropEffect = 'copy';
                }
            } else {
                copy = false;
                this.setCopyState(false);
                /* istanbul ignore next */
                if (isDragEvent(e) && e.dataTransfer) {
                    e.dataTransfer.dropEffect = 'move';
                }
            }
        };

        const createLocateEvent = (e: MouseEvent | DragEvent): LocateEvent => {
            const evt: any = {
                type: 'LocateEvent',
                dragObject,
                target: e.target,
                originalEvent: e,
            };
            const sourceDocument = e.view?.document;

            // event from current document
            if (!sourceDocument || sourceDocument === document) {
                evt.globalX = e.clientX;
                evt.globalY = e.clientY;
            } else {
                // event from simulator sandbox
                let srcSim: ISimulator | undefined;
                const lastSim =
                    lastSensor && isSimulator(lastSensor) ? lastSensor : null;
                // check source simulator
                if (lastSim && lastSim.contentDocument === sourceDocument) {
                    srcSim = lastSim;
                } else {
                    const masterSensor = designer.simulator;
                    if (masterSensor.contentDocument === sourceDocument) {
                        srcSim = masterSensor;
                    }
                    if (!srcSim && lastSim) {
                        srcSim = lastSim;
                    }
                }
                if (srcSim) {
                    // transform point by simulator
                    const g = srcSim.viewport.toGlobalPoint(e);
                    evt.globalX = g.clientX;
                    evt.globalY = g.clientY;
                    evt.canvasX = e.clientX;
                    evt.canvasY = e.clientY;
                    evt.sensor = srcSim;
                } else {
                    // this condition will not happen, just make sure ts ok
                    evt.globalX = e.clientX;
                    evt.globalY = e.clientY;
                }
            }
            return evt;
        };

        const chooseSensor = (e: LocateEvent) => {
            // this.sensors will change on dragstart
            const sensors: ISensor[] = [...this.sensors, designer.simulator];
            let sensor =
                e.sensor && e.sensor.isEnter(e)
                    ? e.sensor
                    : sensors.find((s) => s.sensorAvailable && s.isEnter(e));
            if (!sensor) {
                if (lastSensor) {
                    sensor = lastSensor;
                } else if (e.sensor) {
                    sensor = e.sensor;
                } else if (sourceSensor) {
                    sensor = sourceSensor;
                }
            }
            if (sensor !== lastSensor) {
                if (lastSensor) {
                    lastSensor.deActiveSensor();
                }
                lastSensor = sensor;
            }
            if (sensor) {
                e.sensor = sensor;
                sensor.fixEvent(e);
            }
            this._activeSensor = sensor;
            return sensor;
        };

        const dragstart = () => {
            this._dragging = true;
            setShaken(boostEvent);
            const locateEvent = createLocateEvent(boostEvent);
            chooseSensor(locateEvent);
            this.setDraggingState(true);
            this.emitter.emit('dragstart', locateEvent);
        };

        let lastArrive: any;
        const drag = (e: MouseEvent | DragEvent) => {
            checkCopy(e);

            if (isInvalidPoint(e, lastArrive)) return;

            if (lastArrive && isSameAs(e, lastArrive)) {
                lastArrive = e;
                return;
            }
            lastArrive = e;

            const locateEvent = createLocateEvent(e);
            const sensor = chooseSensor(locateEvent);

            if (sensor) {
                sensor.fixEvent(locateEvent);
                sensor.locate(locateEvent);
            }

            this.emitter.emit('drag', locateEvent);
        };

        const move = (e: MouseEvent | DragEvent) => {
            /* istanbul ignore next */
            if (isFromDragAPI) {
                e.preventDefault();
            }
            if (this._dragging) {
                // process dragging
                drag(e);
                return;
            }

            // first move check is shaken
            if (isShaken(boostEvent, e)) {
                // is shaken dragstart
                dragstart();
                drag(e);
            }
        };

        const drop = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        if (isFromDragAPI) {
            const { dataTransfer } = boostEvent;

            if (dataTransfer) {
                dataTransfer.effectAllowed = 'all';

                try {
                    dataTransfer.setData('application/json', '{}');
                } catch (ex) {
                    // ignore
                }
            }

            dragstart();
        }

        const end = (e?: MouseEvent | DragEvent) => {
            if (e && isDragEvent(e)) {
                e.preventDefault();
            }
            if (lastSensor) {
                lastSensor.deActiveSensor();
            }
            cursor.release();
            let exception;
            if (this._dragging) {
                this._dragging = false;
                try {
                    this.emitter.emit('dragend', { dragObject, copy });
                } catch (ex) /* istanbul ignore next */ {
                    exception = ex;
                }
            }

            handleEvents((doc) => {
                if (isFromDragAPI) {
                    doc.removeEventListener('dragover', move, true);
                    doc.removeEventListener('dragend', end, true);
                    doc.removeEventListener('drop', drop, true);
                } else {
                    doc.removeEventListener('mousemove', move, true);
                    doc.removeEventListener('mouseup', end, true);
                }
                doc.removeEventListener('mousedown', end, true);
                doc.removeEventListener('keydown', checkCopy, false);
                doc.removeEventListener('keyup', checkCopy, false);
            });
            /* istanbul ignore next */
            if (exception) {
                throw exception;
            }
        };

        handleEvents((doc) => {
            /* istanbul ignore next */
            if (isFromDragAPI) {
                doc.addEventListener('dragover', move, true);
                doc.addEventListener('drop', drop, true);
                doc.addEventListener('dragend', end, true);
            } else {
                doc.addEventListener('mousemove', move, true);
                doc.addEventListener('mouseup', end, true);
            }
            doc.addEventListener('mousedown', end, true);
        });

        if (!newBie && !isFromDragAPI) {
            handleEvents((doc) => {
                doc.addEventListener('keydown', checkCopy, false);
                doc.addEventListener('keyup', checkCopy, false);
            });
        }
    }

    /**
     * 添加投放感应区
     */
    addSensor(sensor: ISensor) {
        this.sensors.push(sensor);
    }

    /**
     * 移除投放感应
     */
    removeSensor(sensor: ISensor) {
        const i = this.sensors.indexOf(sensor);
        if (i > -1) {
            this.sensors.splice(i, 1);
        }
    }

    private _dropLocation?: DropLocation;

    get dropLocation() {
        return this._dropLocation;
    }

    /**
     * 创建插入位置，考虑放到 dragon 中
     */
    createLocation(locationData: LocationData): DropLocation {
        const loc = new DropLocation(locationData);
        this._dropLocation = loc;
        this.emitter.emit('dropLocation.change', loc);
        return loc;
    }

    onDropLocationChange(func: (loc: DropLocation) => any) {
        this.emitter.on('dropLocation.change', func);
        return () => {
            this.emitter.off('dropLocation.change', func);
        };
    }

    /**
     * 设置拷贝态
     */
    private setCopyState(state: boolean) {
        cursor.setCopy(state);
        this.designer.simulator.setCopyState(state);
    }

    /**
     * 设置拖拽态
     */
    private setDraggingState(state: boolean) {
        cursor.setDragging(state);
        this.designer.simulator.setDraggingState(state);
    }

    onDragstart(func: (e: LocateEvent) => any) {
        this.emitter.on('dragstart', func);
        return () => {
            this.emitter.off('dragstart', func);
        };
    }

    onDrag(func: (e: LocateEvent) => any) {
        this.emitter.on('drag', func);
        return () => {
            this.emitter.off('drag', func);
        };
    }

    onDragend(func: (x: { dragObject: DragObject; copy: boolean }) => any) {
        this.emitter.on('dragend', func);
        return () => {
            this.emitter.off('dragend', func);
        };
    }
}
