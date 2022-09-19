import { EventEmitter } from 'events';
import { CSSProperties, shallowRef, ShallowRef } from 'vue';
import { ISimulator } from '../types';
import { Project } from '../project';
import { Designer, LocateEvent } from '../designer';

export interface DeviceStyleProps {
    canvas?: CSSProperties;
    viewport?: CSSProperties;
}

export interface SimulatorProps {
    device?: 'mobile' | 'iphone' | string;
    deviceClassName?: string;
    [key: string]: any;
}

export class Simulator implements ISimulator<SimulatorProps> {
    readonly isSimulator = true;

    private emitter = new EventEmitter();

    private _sensorAvailable = true;

    readonly project: Project;

    readonly designer: Designer;

    _props: ShallowRef<SimulatorProps> = shallowRef({});

    get sensorAvailable(): boolean {
        return this._sensorAvailable;
    }

    get device(): string {
        return this.get('device') || 'default';
    }

    get deviceClassName(): string | undefined {
        return this.get('deviceClassName');
    }

    get deviceStyle(): DeviceStyleProps | undefined {
        return this.get('deviceStyle');
    }

    constructor(designer: Designer) {
        this.designer = designer;
        this.project = designer.project;
    }

    setProps(props: SimulatorProps) {
        this._props.value = props;
    }

    set(key: string, value: any) {
        this._props.value = {
            ...this._props.value,
            [key]: value,
        };
    }

    get(key: string): any {
        return this._props.value[key];
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
