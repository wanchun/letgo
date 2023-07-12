import type { IPublicTypeSetter } from '@fesjs/letgo-types';
import { SetterManager } from '@fesjs/letgo-designer';

export class Setters {
    /**
     * 获取指定 setter
     */
    getSetter(type: string) {
        return SetterManager.getSetter(type);
    }

    /**
     * 获取已注册的所有 settersMap
     */
    getSettersMap() {
        return SetterManager.getSettersMap();
    }

    /**
     * 注册 setters
     */
    register(setters: IPublicTypeSetter[]) {
        return SetterManager.register(setters);
    }
}
