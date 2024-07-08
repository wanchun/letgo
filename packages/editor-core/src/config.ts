import type { CSSProperties } from 'vue';
import type { IPublicTypeDevice } from '@webank/letgo-types';
import { isPlainObject, get as lodashGet } from 'lodash-es';
import type { createRequest } from '@qlin/request';

export interface IEngineOptions {
    vueRuntimeUrl?: string;
    /**
     * 设置 simulator 相关的 url
     */
    simulatorUrl?: string[];

    letgoRequest?: ReturnType<typeof createRequest>;

    /**
     *
     * 设计模式，live 模式将会实时展示变量值，默认值：'design'
     */
    designMode?: 'design' | 'live';
    /**
     * 设备类型，默认值：'default'
     */
    device?: IPublicTypeDevice;
    /**
     * 指定初始化的 deviceClassName，挂载到画布的顶层节点上
     */
    deviceClassName?: string;
    /**
     * 设备类型映射器，处理设计器与渲染器中 device 的映射
     */
    deviceStyle?: {
        canvas?: CSSProperties;
        viewport?: CSSProperties;
    };
    /**
     * 设置所有属性支持变量配置，默认值：true
     */
    supportVariableGlobally?: boolean;

    /**
     * @default false
     * 开启右键菜单能力
     */
    enableContextMenu?: boolean;
}

export class EngineConfig {
    private config: { [key: string]: any } = {};

    private waits = new Map<
        string,
        Array<{
            once?: boolean;
            resolve: (data: any) => void;
        }>
    >();

    constructor(config?: { [key: string]: any }) {
        this.config = config || {};
    }

    /**
     * 判断指定 key 是否有值
     * @param key
     * @returns
     */
    has(key: string): boolean {
        return this.config[key] !== undefined;
    }

    /**
     * 获取指定 key 的值
     * @param key
     * @param defaultValue
     * @returns
     */
    get(key: string, defaultValue?: any): any {
        return lodashGet(this.config, key, defaultValue);
    }

    /**
     * 设置指定 key 的值
     * @param key
     * @param value
     */
    set(key: string, value: any) {
        this.config[key] = value;
        this.notifyGot(key);
    }

    /**
     * 批量设值，set 的对象版本
     * @param config
     */
    setConfig(config: { [key: string]: any }) {
        if (config) {
            Object.keys(config).forEach((key) => {
                this.set(key, config[key]);
            });
        }
    }

    /**
     * if engineOptions.strictPluginMode === true, only accept propertied predefined in IEngineOptions.
     *
     * @param {IEngineOptions} engineOptions
     * @memberof EngineConfig
     */
    setEngineOptions(engineOptions: IEngineOptions) {
        const defaultOptions: IEngineOptions = {
            device: 'default',
            designMode: 'design',
            supportVariableGlobally: true,
        };
        if (!engineOptions || !isPlainObject(engineOptions)) {
            this.setConfig(defaultOptions);
            return;
        }
        this.setConfig(Object.assign(defaultOptions, engineOptions));
    }

    /**
     * 获取指定 key 的值，若此时还未赋值，则等待，若已有值，则直接返回值
     *  注：此函数返回 Promise 实例，只会执行（fullfill）一次
     * @param key
     * @returns
     */
    onceGot(key: string): Promise<any> {
        const val = this.config[key];
        if (val !== undefined)
            return Promise.resolve(val);

        return new Promise((resolve) => {
            this.setWait(key, resolve, true);
        });
    }

    /**
     * 获取指定 key 的值，函数回调模式，若多次被赋值，回调会被多次调用
     * @param key
     * @param fn
     * @returns
     */
    onGot(key: string, fn: (data: any) => void): () => void {
        const val = this.config?.[key];
        if (val !== undefined)
            fn(val);

        this.setWait(key, fn);
        return () => {
            this.delWait(key, fn);
        };
    }

    private notifyGot(key: string) {
        let waits = this.waits.get(key);
        if (!waits)
            return;

        waits = waits.slice().reverse();
        let i = waits.length;
        while (i--) {
            waits[i].resolve(this.get(key));
            if (waits[i].once)
                waits.splice(i, 1);
        }
        if (waits.length > 0)
            this.waits.set(key, waits);

        else
            this.waits.delete(key);
    }

    private setWait(key: string, resolve: (data: any) => void, once?: boolean) {
        const waits = this.waits.get(key);
        if (waits)
            waits.push({ resolve, once });

        else
            this.waits.set(key, [{ resolve, once }]);
    }

    private delWait(key: string, fn: any) {
        const waits = this.waits.get(key);
        if (!waits)
            return;

        let i = waits.length;
        while (i--) {
            if (waits[i].resolve === fn)
                waits.splice(i, 1);
        }
        if (waits.length < 1)
            this.waits.delete(key);
    }

    purge(): void {
        this.config = {};
    }
}

export const engineConfig = new EngineConfig();
