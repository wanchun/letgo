import { isPlainObject, isString } from 'lodash-es';
import { IEnumCacheType } from '@webank/letgo-types';
import rendererConfig from '../../config';

const CACHE_KEY_PREFIX = 'letgo-query_';

interface CacheConfig {
    id: string;
    enableCaching: boolean;
    cacheDuration: number;
    type: IEnumCacheType;
    params?: Record<string, any>;
}

export type ParamsType = string | Record<string, any> | Blob | File | FormData | ArrayBuffer | URLSearchParams | DataView;

function stringifyParams(params: ParamsType) {
    if (isURLSearchParams(params))
        return params.toString();

    if (typeof params === 'string')
        return params;

    if (isPlainObject(params))
        return JSON.stringify(params);

    return '';
}

function genInnerKey(config: CacheConfig) {
    const key = `${config.id}_${stringifyParams(config.params)}`;
    if (config.type !== IEnumCacheType.RAM)
        return `${CACHE_KEY_PREFIX}${key}`;

    return key;
}

function getFormattedCache(config: CacheConfig): CacheConfig {
    return {
        id: config.id,
        enableCaching: config.enableCaching || true,
        type: config.type || IEnumCacheType.RAM,
        cacheDuration: (config.cacheDuration || 0) * 1000,
    };
}

export function isURLSearchParams(obj: any) {
    return Object.prototype.toString.call(obj) === '[object URLSearchParams]';
}

function canCache(data: any) {
    return isPlainObject(data) || isString(data) || Array.isArray(data) || isURLSearchParams(data);
}

interface CacheData {
    cacheType: IEnumCacheType;
    data: any;
    cacheDuration: number;
    expire: number;
}

function isExpire(cacheData: CacheData) {
    if (!cacheData.cacheDuration || cacheData.expire >= Date.now())
        return false;

    return true;
}

class RamCache {
    data: Map<string, CacheData>;
    constructor() {
        this.data = new Map();
    }

    get(key: string) {
        const result = this.data.get(key);
        if (result && isExpire(result)) {
            this.data.delete(key);
            return null;
        }
        return result ? result.data : null;
    }

    set(key: string, value: CacheData) {
    // 超时清理数据
        this.data.forEach((value, key, map) => {
            if (isExpire(value))
                map.delete(key);
        });
        if (this.data.size > 1000) {
            rendererConfig.logWarn('Request: ram cache is exceed 1000 item, please check cache size');
            return;
        }

        this.data.set(key, value);
    }

    deleteWithPrefix(prefix: string) {
        this.data.forEach((value, key, map) => {
            if (key.startsWith(prefix))
                map.delete(key);
        });
    }

    delete(key: string) {
        this.data.delete(key);
    }
}

const rawCacheImpl = new RamCache();

function setCacheData(key: string, response: any, config: CacheConfig) {
    const currentCacheData: CacheData = {
        cacheType: config.type,
        data: response,
        cacheDuration: config.cacheDuration,
        expire: Date.now() + config.cacheDuration || 0,
    };
    if (config.type !== IEnumCacheType.RAM) {
        const cacheInstance: any = window[config.type];
        try {
            cacheInstance.setItem(key, JSON.stringify(currentCacheData));
        }
        catch (e) {
            // setItem 出现异常，清理缓存
            for (const item in cacheInstance) {
                if (item.startsWith(CACHE_KEY_PREFIX) && Object.prototype.hasOwnProperty.call(cacheInstance, item))
                    cacheInstance.removeItem(item);
            }
        }
    }
    else {
        rawCacheImpl.set(key, currentCacheData);
    }
}

function getCacheData(key: string, config: CacheConfig) {
    if (config.type !== IEnumCacheType.RAM) {
        const cacheInstance: any = window[config.type];
        const text = cacheInstance.getItem(key) || null;
        try {
            const currentCacheData = JSON.parse(text);
            if (currentCacheData && !isExpire(currentCacheData))
                return currentCacheData.data;

            cacheInstance.removeItem(key);
            return null;
        }
        catch (e) {
            cacheInstance.removeItem(key);
            return null;
        }
    }
    else {
        return rawCacheImpl.get(key);
    }
}

// 存储缓存队列
const cacheStartFlag = new Map();
const cachingQueue = new Map();

/**
 * 等上一次请求结果
 * 1. 如果上一次请求成功，直接使用上一次的请求结果
 * 2. 如果上一次请求失败，重启本次请求
 */
function handleCachingStart(key: string) {
    const caching = cacheStartFlag.get(key);
    if (caching) {
        return new Promise((resolve) => {
            const queue = cachingQueue.get(key) || [];
            cachingQueue.set(key, queue.concat(resolve));
        });
    }
    cacheStartFlag.set(key, true);
}

// 有请求成功的
function handleCachingQueueSuccess(key: string, response: any) {
    // 移除首次缓存 flag
    const queue = cachingQueue.get(key);
    if (queue && queue.length > 0) {
        queue.forEach((resolve: (value: unknown) => void) => {
            resolve(response);
        });
    }
    cachingQueue.delete(key);
    cacheStartFlag.delete(key);
}

// 处理请求失败
function handleCachingQueueError(key: string) {
    const queue = cachingQueue.get(key);
    if (queue && queue.length > 0) {
        const firstResolve = queue.shift();
        firstResolve();
        cachingQueue.set(key, queue);
    }
    else {
        cachingQueue.delete(key);
        cacheStartFlag.delete(key);
    }
}

export function clearCache(id: string, type: IEnumCacheType) {
    if (type !== IEnumCacheType.RAM) {
        const prefix = `${CACHE_KEY_PREFIX}${id}_`;
        const storage: any = window[type];
        for (const key in storage) {
            if (key.startsWith(prefix) && Object.prototype.hasOwnProperty.call(storage, key))
                storage.removeItem(key);
        }
    }
    else {
        rawCacheImpl.deleteWithPrefix(`${id}_`);
    }
}

export async function cacheControl(config: CacheConfig, fn: () => Promise<any>) {
    if (config.enableCaching) {
        const key = genInnerKey(config);
        const cacheConfig = getFormattedCache(config);
        const cacheData = getCacheData(key, cacheConfig);
        if (cacheData)
            return cacheData;

        let response = await handleCachingStart(key);
        if (response)
            return response;

        try {
            response = await fn();

            if (canCache(response)) {
                handleCachingQueueSuccess(key, response);
                setCacheData(key, response, cacheConfig);
            }
            else {
                rendererConfig.logWarn(`[query cache]: ${key} 响应数据无法序列化，无法缓存，请移除相关配置`);
            }

            return response;
        }
        catch (err) {
            handleCachingQueueError(key);
            throw err;
        }
    }
    else {
        return fn();
    }
}
