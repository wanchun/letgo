import {
    IEnumEventHandlerAction,
    type IEventHandler,
    type IPublicTypeJSFunction,
    isRunFunctionEventHandler,
    isSetLocalStorageEventHandler,
    isSetTemporaryStateEventHandler,
} from '@webank/letgo-types';
import { camelCase } from 'lodash-es';
import { isExpression } from './helper';
import type { Context } from './types';

export function genEventName(prop: string, refName: string) {
    return camelCase(`${prop}_${refName}`);
}

function handleParams(params: string[]) {
    return params.map((param) => {
        return param.trim();
    });
}

function compilerEventHandler(ctx: Context, event: IEventHandler) {
    let params = (event.params || []).filter(Boolean).map((param) => {
        if (isExpression(ctx, param))
            return param;

        return JSON.stringify(param);
    });

    if (isRunFunctionEventHandler(event)) {
        params = params.concat('...args');
        return `(...args) => ${event.namespace}(${params.join(', ')})`;
    }

    if (event.action === IEnumEventHandlerAction.CONTROL_QUERY)
        return `(...args) => ${event.namespace}.${event.method}(...args)`;

    if (event.action === IEnumEventHandlerAction.CONTROL_COMPONENT)
        return `(...args) => ${event.namespace}.${event.method}(...args)`;

    if (isSetTemporaryStateEventHandler(event)) {
        params.reverse();
        return `(...args) => ${event.namespace}.${event.method}(${event.params.join(', ')})`;
    }

    if (isSetLocalStorageEventHandler(event)) {
        if (event.method === 'setValue')
            return `(...args) => ${event.namespace}.${event.method}(${event.params[0]}, ${event.params[1]})`;

        else
            return `()=> ${event.namespace}.${event.method}()`;
    }

    return null;
}

export function compilerEventHandlers(ctx: Context, events: IEventHandler[]) {
    const result: {
        [key: string]: string[]
    } = {};
    events.forEach((item: IEventHandler) => {
        if ((item.namespace && item.method) || item.action === IEnumEventHandlerAction.RUN_FUNCTION) {
            const jsExpression = compilerEventHandler(ctx, item);
            result[item.name] = (result[item.name] || []).concat(jsExpression);
        }
    });

    return result;
}

export function funcSchemaToFunc(schema: IPublicTypeJSFunction) {
    if (schema.params && schema.params.length > 0) {
        return `function (...args) {
            const params = [${handleParams(schema.params).join(', ')}]; 
            return (${schema.value})(...params, ...args);
        }`;
    }

    return `
    function (...args) {
        return (${schema.value})(...args);
    }
    `;
}
