import { EventEmitter } from 'events';
import { CSSProperties, ComputedRef, computed, reactive } from 'vue';
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

    _props: SimulatorProps = reactive({});

    get sensorAvailable(): boolean {
        return this._sensorAvailable;
    }

    device: ComputedRef<string> = computed(() => {
        return this.get('device') || 'default';
    });

    deviceClassName: ComputedRef<string | undefined> = computed(() => {
        return this.get('deviceClassName');
    });

    deviceStyle: ComputedRef<DeviceStyleProps | undefined> = computed(() => {
        return this.get('deviceStyle');
    });

    constructor(designer: Designer) {
        this.designer = designer;
        this.project = designer.project;
    }

    setProps(props: SimulatorProps) {
        for (const p in this._props) {
            delete this._props[p];
        }
        Object.assign(this._props, props);
    }

    set(key: string, value: any) {
        Object.assign(this._props, { [key]: value });
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

    pure() {}
}
