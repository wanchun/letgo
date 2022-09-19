import { EventEmitter } from 'events';
import { CSSProperties } from 'vue';
import { ISimulator } from '../types';
import { Project } from '../project';
import { Designer, LocateEvent } from '../designer';

export interface DeviceStyleProps {
    canvas?: CSSProperties;
    viewport?: CSSProperties;
}

export interface SimulatorProps {
    designMode?: 'live' | 'design' | 'preview' | 'extend' | 'border';
    device?: 'mobile' | 'iphone' | string;
    [key: string]: any;
}

export class Simulator implements ISimulator<SimulatorProps> {
    readonly isSimulator = true;

    private emitter = new EventEmitter();

    private _sensorAvailable = true;

    readonly project: Project;

    readonly designer: Designer;

    _props: SimulatorProps = {};

    get sensorAvailable(): boolean {
        return this._sensorAvailable;
    }

    get device(): string {
        return this.get('device') || 'default';
    }

    get deviceStyle(): DeviceStyleProps | undefined {
        return this.get('deviceStyle');
    }

    constructor(designer: Designer) {
        this.designer = designer;
        this.project = designer.project;
    }

    setProps(props: SimulatorProps) {
        this._props = props;
    }

    set(key: string, value: any) {
        this._props = {
            ...this._props,
            [key]: value,
        };
    }

    get(key: string): any {
        return this._props[key];
    }

    fixEvent(e: LocateEvent): LocateEvent {
        return e;
    }

    locate(e: LocateEvent): DropLocation | undefined | null {
        return e;
    }

    isEnter(e: LocateEvent): boolean {
        return true;
    }

    deActiveSensor(): void {}

    getNodeInstanceFromElement(
        e: Element | null,
    ): NodeInstance<ComponentInstance> | null {
        return null;
    }
}
