export default {
    src: {
        pages: {},
        common: {
            'letgoConstants.js': `
export const RunCondition = {
    MANUAL: 0,
    PageLoads: 1,
};

export const CodeType = {
    JAVASCRIPT_QUERY: 'query',
    JAVASCRIPT_COMPUTED: 'computed',
    TEMPORARY_STATE: 'state',
};
            `,
            'reactive.js': `
import { computed, reactive, shallowReactive } from 'vue';

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
}

    `,
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
        },
        use: {
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
                return null;
            }
        }),
    });
}
`,
            'useInstance.js': `
import { ref } from 'vue';

export function useInstance() {
    const refEl = ref();
    const proxy = new Proxy({}, {
        get(_, key) {
            return refEl.value?.[key];
        },
        set(_, key, value) {
            if (refEl.value)
                refEl.value[key] = value;
        },
    });
    return [refEl, proxy];
}
        
        `,
            'useJSQuery.js': `
import { markReactive } from '@/common/reactive';
import { RunCondition } from '@/common/letgoConstants';

class JSQuery {
    constructor(data) {
        markReactive(this, {
            id: data.id,
            query: data.query,
            enableCaching: false,
            cacheDuration: null,
            enableTransformer: data.enableTransformer || false,
            transformer: data.transformer,
            showFailureToaster: data.showFailureToaster || false,
            showSuccessToaster: data.showSuccessToaster || false,
            runWhenPageLoads: data.runWhenPageLoads || false,
            successMessage: data.successMessage || '',
            queryTimeout: data.queryTimeout,
            runCondition: data.runCondition || RunCondition.MANUAL,
            queryFailureCondition: data.queryFailureCondition || [],
            successEvent: data.successEvent || [],
            failureEvent: data.failureEvent || [],

            data: null,
            error: null,
            loading: false,
        });
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

    async trigger() {
        if (this.enableCaching && this.cacheTime && (Date.now() - this.cacheTime) < this.cacheDuration * 1000)
            return;

        if (this.query) {
            try {
                this.loading = true;
                if (this.queryTimeout)
                    this.data = await Promise.race([this.timeoutPromise(this.queryTimeout), this.query()]);
                else
                    this.data = await this.query();

                if (this.enableTransformer && this.transformer)
                    this.data = await this.transformer(this.data);

                this.cacheTime = Date.now();
                this.successEvent.forEach((eventHandler) => {
                    eventHandler();
                });
            } catch (err) {
                this.failureEvent.forEach((eventHandler) => {
                    eventHandler();
                });
                if (err instanceof Error)
                    this.error = err.message;
            } finally {
                this.loading = false;
            }
        }
    }

    clearCache() {
        this.cacheTime = null;
    }

    reset() {
        this.clearCache();
        this.data = null;
        this.error = null;
    }
}

export function useJSQuery(data) {
    const result = new JSQuery(data);

    if (data.runWhenPageLoads)
        result.trigger();

    return result;
}

        `,
            'useTemporaryState.js': `
import { reactive } from 'vue';

export function useTemporaryState({ id, initValue }) {
    const result = reactive({
        id,
        value: initValue,
        setValue,
    });
    function setValue(val) {
        result.value = val;
    }
    return result;
}

        `,
        },
    },
};