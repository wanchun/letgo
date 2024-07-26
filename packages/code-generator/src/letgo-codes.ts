export const LETGO_CODES = {
    'shared.js': `
export function isGetterProp(instance, key) {
    if (key in instance) {
        let p = instance;
        let propDesc;
        while (p && !propDesc) {
            propDesc = Object.getOwnPropertyDescriptor(p, key);
            p = Object.getPrototypeOf(p);
        }
        // only getter
        return !!propDesc && (propDesc.get && !propDesc.set);
    }
    return false;
}

export function getAllMethodAndProperties(obj) {
    let props = [];

    do {
        const l = Object.getOwnPropertyNames(obj)
            .concat(Object.getOwnPropertySymbols(obj).map(s => s.toString()))
            .sort()
            .filter((p, i, arr) =>
                !['constructor', '_globalCtx'].includes(p) // not the constructor
                && (i === 0 || p !== arr[i - 1]) // not overriding in this prototype
                && !props.includes(p), // not overridden in a child
            );
        props = props.concat(l);
    }
    while (
        // eslint-disable-next-line no-cond-assign
        (obj = Object.getPrototypeOf(obj)) // walk-up the prototype chain
        && Object.getPrototypeOf(obj) // not the the Object prototype methods (hasOwnProperty, etc...)
    );

    return props.reverse();
}
    `,
    'letgoConstants.js': `
export const IEnumRunCondition = {
    MANUAL: 0,
    PageLoads: 1,
};

export const IEnumCodeType = {
    JAVASCRIPT_QUERY: 'query',
    JAVASCRIPT_COMPUTED: 'computed',
    TEMPORARY_STATE: 'temporaryState',
};

export const IEnumCacheType = {
    RAM: 'ram',
    SESSION_STORAGE: 'sessionStorage',
    LOCAL_STORAGE: 'localStorage',
};
`,
    'reactive.js': `
import { computed, reactive, shallowReactive } from 'vue';
import { getAllMethodAndProperties } from './shared.js'

export function markClassReactive(target, filter) {
    const members = getAllMethodAndProperties(target).filter((member) => {
        if (filter)
            return filter(member);

        return true;
    });

    const state = reactive(members.reduce((acc, cur) => {
        acc[cur] = target[cur];
        return acc;
    }, {}));
    members.forEach((key) => {
        Object.defineProperty(target, key, {
            get() {
                return state[key];
            },
            set(value) {
                state[key] = value;
            },
        });
    });
    return target;
}

export function markShallowReactive(target, properties) {
    const state = shallowReactive(properties);
    Object.keys(properties).forEach((key) => {
        Object.defineProperty(target, key, {
            get() {
                return state[key];
            },
            set(value) {
                state[key] = value;
            },
        });
    });
    return target;
}

export function markReactive(target, properties) {
    const state = reactive(properties);
    Object.keys(properties).forEach((key) => {
        Object.defineProperty(target, key, {
            get() {
                return state[key];
            },
            set(value) {
                state[key] = value;
            },
        });
    });
    return target;
}

export function markComputed(target, properties) {
    const prototype = Object.getPrototypeOf(target);
    properties.forEach((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
        if (descriptor?.get) {
            const tmp = computed(descriptor.get.bind(target));
            Object.defineProperty(target, key, {
                get() {
                    return tmp.value;
                },
            });
        }
    });
    return target;
}`,
    'letgoRequest.js': `
import { createRequest } from '@qlin/request';
import { isPlainObject } from 'lodash-es';

export const letgoRequest = createRequest({
    mode: 'cors',
    credentials: 'same-origin',
    transformData: (res) => {
        if (isPlainObject(res))
            return res.data ? res.data : res;

        return res;
    },
});
`,
    'useComputed.js': `
import { computed, reactive } from 'vue';

export function useComputed({
    id,
    func,
}) {
    return reactive({
        id,
        value: computed(() => {
            try {
                return func();
            } catch (_) {
                console.warn(_);
                return null;
            }
        }),
    });
}`,
    'useInstance.js': `
import { ref } from 'vue';

export function useInstance() {
    const refEl = ref();
    const proxy = new Proxy({}, {
        get(_, key) {
            if (typeof refEl.value?.[key] === 'function' && refEl.value.hasOwnProperty && !refEl.value.hasOwnProperty(key)) {
                return refEl.value[key].bind(refEl.value)
            }
            return refEl.value?.[key];
        },
        set(_, key, value) {
            if (refEl.value)
                refEl.value[key] = value;
        },
    });
    return [refEl, proxy];
}`,
    'cache-control.js': `
import { isPlainObject, isString } from 'lodash-es';
import { IEnumCacheType } from './letgoConstants';

const CACHE_KEY_PREFIX = 'letgo-query_';


function isURLSearchParams(obj) {
    return Object.prototype.toString.call(obj) === '[object URLSearchParams]';
}

function stringifyParams(params) {
    if (isURLSearchParams(params))
        return params.toString();

    if (typeof params === 'string')
        return params;

    if (isPlainObject(params))
        return JSON.stringify(params);

    return '';
}

function genInnerKey(config) {
    const key = \`\${config.id}_\${stringifyParams(config.params)}\`;
    if (config.type !== IEnumCacheType.RAM)
        return \`\${CACHE_KEY_PREFIX}\${key}\`;

    return key;
}

function getFormattedCache(config) {
    return {
        id: config.id,
        enableCaching: config.enableCaching || true,
        type: config.type || IEnumCacheType.RAM,
        cacheDuration: (config.cacheDuration || 0) * 1000,
    };
}

function canCache(data) {
    return isPlainObject(data) || isString(data) || Array.isArray(data) || isURLSearchParams(data);
}

function isExpire(cacheData) {
    if (!cacheData.cacheDuration || cacheData.expire >= Date.now())
        return false;

    return true;
}

class RamCache {
    constructor() {
        this.data = new Map();
    }

    get(key) {
        const result = this.data.get(key);
        if (result && isExpire(result)) {
            this.data.delete(key);
            return null;
        }
        return result ? result.data : null;
    }

    set(key, value) {
    // 超时清理数据
        this.data.forEach((value, key, map) => {
            if (isExpire(value))
                map.delete(key);
        });
        if (this.data.size > 1000) {
            console.warn('Request: ram cache is exceed 1000 item, please check cache size');
            return;
        }

        this.data.set(key, value);
    }

    deleteWithPrefix(prefix) {
        this.data.forEach((value, key, map) => {
            if (key.startsWith(prefix))
                map.delete(key);
        });
    }

    delete(key) {
        this.data.delete(key);
    }
}

const rawCacheImpl = new RamCache();

function setCacheData(key, response, config) {
    const currentCacheData = {
        cacheType: config.type,
        data: response,
        cacheDuration: config.cacheDuration,
        expire: Date.now() + config.cacheDuration || 0,
    };
    if (config.type !== IEnumCacheType.RAM) {
        const cacheInstance = window[config.type];
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

function getCacheData(key, config) {
    if (config.type !== IEnumCacheType.RAM) {
        const cacheInstance = window[config.type];
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
function handleCachingStart(key) {
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
function handleCachingQueueSuccess(key, response) {
    // 移除首次缓存 flag
    const queue = cachingQueue.get(key);
    if (queue && queue.length > 0) {
        queue.forEach((resolve) => {
            resolve(response);
        });
    }
    cachingQueue.delete(key);
    cacheStartFlag.delete(key);
}

// 处理请求失败
function handleCachingQueueError(key) {
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

export function clearCache(id, type) {
    if (type !== IEnumCacheType.RAM) {
        const prefix = \`\${CACHE_KEY_PREFIX}\${id}_\`;
        const storage = window[type];
        for (const key in storage) {
            if (key.startsWith(prefix) && Object.prototype.hasOwnProperty.call(storage, key))
                storage.removeItem(key);
        }
    }
    else {
        rawCacheImpl.deleteWithPrefix(\`\${id}_\`);
    }
}

export async function cacheControl(config, fn) {
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
                console.warn(\`[query cache]: \${key} 响应数据无法序列化，无法缓存，请移除相关配置\`);
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
`,
    'useJSQuery.js': `
import { isPlainObject } from 'lodash-es';
import { markReactive } from './reactive';
import { IEnumRunCondition, IEnumCacheType } from './letgoConstants';
import { cacheControl, clearCache } from './cache-control';

class JSQuery {
    constructor(data) {
        markReactive(this, {
            id: data.id,
            query: data.query,
            params: data.params,

            enableCaching: data.enableCaching || false,
            cacheDuration: data.cacheDuration || null,
            cacheType: data.cacheType || IEnumCacheType.RAM,

            enableTransformer: data.enableTransformer || false,
            transformer: data.transformer,
            runWhenPageLoads: data.runWhenPageLoads || false,
            queryTimeout: data.queryTimeout,
            runCondition: data.runCondition || IEnumRunCondition.MANUAL,
            successEvent: data.successEvent || [],
            failureEvent: data.failureEvent || [],
            data: null,
            response: null,
            error: null,
            loading: false,
        });

        this.hasBeenCalled = false;
    }

    timeoutPromise(timeout) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject({
                    type: 'TIMEOUT',
                    msg: '请求超时',
                });
            }, timeout);
        });
    }
    
    formatParams(extraParams) {
        const params = this.params;
        if (!params) {
            return extraParams || null;
        }
    
        if (isPlainObject(params) && isPlainObject(extraParams))
            return { ...params, ...extraParams };
    
        return params;
    }

    async trigger(extraParams) {
        if (this.query) {
            try {
                this.hasBeenCalled = true;
                this.loading = true;
                const params = this.formatParams(extraParams)
                const response = await cacheControl({
                    id: this.id,
                    enableCaching: this.enableCaching,
                    cacheDuration: this.cacheDuration,
                    type: this.cacheType,
                    params,
                }, async () => {
                    if (this.queryTimeout)
                        return Promise.race([this.timeoutPromise(this.queryTimeout), this.query(params)]);

                    return this.query(params);
                });

                this.response = response;
                let data = response?.data;
                if (this.enableTransformer && this.transformer)
                    data = await this.transformer(data);

                this.data = data;
                this.error = null;
                this.successEvent.forEach((eventHandler) => {
                    eventHandler(data);
                });
                return this.data;
            } catch (err) {
                this.data = null;
                this.failureEvent.forEach((eventHandler) => {
                    eventHandler(err);
                });
                if (err instanceof Error)
                    this.error = err.message;

                console.warn(err);
                throw err;
            } finally {
                this.loading = false;
            }
        }
    }

    clearCache() {
        clearCache(this.id, this.cacheType)
    }

    reset() {
        this.clearCache();
        this.data = null;
        this.error = null;
    }
}

export function useJSQuery(data) {
    const result = new JSQuery(data);

    if (!data._isGlobalQuery && data.runWhenPageLoads)
        result.trigger();

    return result;
}`,
    'useTemporaryState.js': `
import { reactive } from 'vue';
import { isPlainObject, set } from 'lodash-es';

export function useTemporaryState({ id, initValue }) {
    const result = reactive({
        id,
        value: initValue,
        setValue,
        setIn,
    });
    
    function setIn(path, val) {
        if (isPlainObject(result.value)) {
            set(result.value, path, val);
        }
    }

    function setValue(val) {
        result.value = val;
    }

    return result;
}`,
    'globalBase.js': `
import { omit } from 'lodash-es';
import { letgoRequest } from './letgoRequest';

export class LetgoGlobalBase {
    constructor(globalCtx) {
        this.globalCtx = globalCtx;
        this.$request = letgoRequest;
    }

    get $utils() {
        return this.globalCtx.$utils;
    }

    get $context() {
        return this.globalCtx.$context;
    }

    get $globalCode() {
        return omit(this.globalCtx, '$utils', '$context');
    }
}
    `,
    'pageBase.js': `
import { LetgoGlobalBase } from './globalBase';

export class LetgoPageBase extends LetgoGlobalBase {
    constructor(ctx) {
        super(ctx.globalCtx);
        this.$pageCode = ctx.codes;
        this.$refs = ctx.instances;
    }
}
    `,
};
