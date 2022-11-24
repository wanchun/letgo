import { Setter } from '@webank/letgo-types';
import { SetterFactory } from '@webank/letgo-designer';

export class Setters {
    /**
     * 获取指定 setter
     */
    getSetter(type: string) {
        return SetterFactory.getSetter(type);
    }

    /**
     * 获取已注册的所有 settersMap
     */
    getSettersMap() {
        return SetterFactory.getSettersMap();
    }

    /**
     * 注册 setters
     */
    register(setters: Setter[]) {
        return SetterFactory.register(setters);
    }
}
