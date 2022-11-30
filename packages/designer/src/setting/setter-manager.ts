import { Setter, CustomView } from '@webank/letgo-types';
import { VNode, createVNode } from 'vue';

export class SetterFactory {
    private static renderMap = new Map<string, Setter>();

    static register(commands: Setter[]) {
        commands.forEach((command) => {
            this.renderMap.set(command.type, command);
        });
    }

    static getSetter(type: string): Setter | null {
        return this.renderMap.get(type) || null;
    }

    static getSettersMap() {
        return this.renderMap;
    }
}

export function createSetterContent(
    setter: string | CustomView,
    props: Record<string, any>,
): VNode[] {
    if (typeof setter === 'string') {
        const _setter = SetterFactory.getSetter(setter);
        if (!_setter) {
            return null;
        }
        return [createVNode(_setter.Component, props)];
    }

    return setter(props);
}
