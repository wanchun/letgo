import type { IPublicTypeSetter } from '@webank/letgo-types';

export class SetterManager {
    private static renderMap = new Map<string, IPublicTypeSetter>();

    static register(commands: IPublicTypeSetter[]) {
        commands.forEach((command) => {
            this.renderMap.set(command.type, command);
        });
    }

    static getSetter(type: string): IPublicTypeSetter | null {
        return this.renderMap.get(type) || null;
    }

    static getSettersMap() {
        return this.renderMap;
    }
}
