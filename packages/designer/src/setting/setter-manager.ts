import { Setter } from '@webank/letgo-types';

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
