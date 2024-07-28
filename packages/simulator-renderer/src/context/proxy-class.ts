import { isReactiveClassProp } from '@webank/letgo-common';
import { isUndefined } from 'lodash-es';
import { reactive } from 'vue';

export class ProxyClass {
    target: Record<string, any>;
    state: Record<string, any>;
    cacheRawKeys: Set<string>;
    cacheReactiveKeys: Set<string>;
    constructor() {
        this.target = {};
        this.state = reactive<Record<string, any>>({});
        this.cacheRawKeys = new Set();
        this.cacheReactiveKeys = new Set();
    }

    changeTarget(newTarget: Record<string, any>) {
        this.cacheRawKeys.clear();

        this.cacheReactiveKeys.forEach((key) => {
            if (isUndefined(newTarget[key]))
                delete this.state[key];
            else
                this.state[key] = newTarget[key];
        });

        this.cacheReactiveKeys.clear();

        this.target = newTarget;
    }

    setProxy(property: string) {
        Object.defineProperty(this.target, property, {
            get: () => {
                return this.state[property];
            },
            set: (value) => {
                this.state[property] = value;
            },
        });
    }

    getThisProxy() {
        return new Proxy({}, {
            get: (_, property: string) => {
                if (typeof property !== 'string')
                    return this.target[property];

                if (this.cacheRawKeys.has(property))
                    return this.target[property];

                if (this.cacheReactiveKeys.has(property))
                    return this.state[property];

                if (isReactiveClassProp(this.target, property)) {
                    this.cacheReactiveKeys.add(property);
                    this.state[property] = this.target[property];
                    this.setProxy(property);
                    return this.state[property];
                }
                else {
                    this.cacheRawKeys.add(property);
                    return this.target[property];
                }
            },
            set: (_, property: string, value) => {
                if (typeof property !== 'string') {
                    this.target[property] = value;
                    return true;
                }
                if (this.cacheRawKeys.has(property))
                    this.target[property] = value;

                if (this.cacheReactiveKeys.has(property))
                    this.state[property] = value;

                if (isReactiveClassProp(this.target, property)) {
                    this.cacheReactiveKeys.add(property);
                    this.setProxy(property);
                    this.state[property] = value;
                }
                else {
                    this.cacheRawKeys.add(property);
                    this.target[property] = value;
                }
                return true;
            },
        });
    }
}
