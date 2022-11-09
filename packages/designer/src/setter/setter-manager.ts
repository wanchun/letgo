import { Setter } from './types';

export class Factory {
    private static renderMap = new Map<string, Setter>();

    static register(commands: Setter[]) {
        commands.forEach((command) => {
            this.renderMap.set(command.renderType, command);
        });
    }

    static getSetter(type: string): Setter | null {
        return this.renderMap.get(type) || null;
    }

    static getSettersMap() {
        return this.renderMap;
    }
}
