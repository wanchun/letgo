import {
    IEnumEventHandlerAction,
    type IEventHandler,
    type IPublicTypeJSFunction,
    isRunFunctionEventHandler,
    isSetLocalStorageEventHandler,
    isSetTemporaryStateEventHandler,
} from '@webank/letgo-types';
import { camelCase } from 'lodash-es';

export function genEventName(prop: string, refName: string) {
    return camelCase(`${prop}_${refName}`);
}

function handleParams(params: string[]) {
    return params.map((param) => {
        return param.trim();
    });
}

function compilerEventHandler(event: IEventHandler) {
    if (isRunFunctionEventHandler(event)) {
        const params = (event.params || []).filter(Boolean).concat('...args');
        return `(...args) => ${event.namespace}(${params.join(', ')})`;
    }
    else if (event.action === IEnumEventHandlerAction.CONTROL_QUERY) {
        return `(...args) => ${event.namespace}.${event.method}(...args)`;
    }
    else if (event.action === IEnumEventHandlerAction.CONTROL_COMPONENT) {
        return `(...args) => ${event.namespace}.${event.method}(...args)`;
    }
    else if (isSetTemporaryStateEventHandler(event)) {
        const params = [...event.params];
        params.reverse();
        return `(...args) => ${event.namespace}.${event.method}(${event.params.join(', ')})`;
    }
    else if (isSetLocalStorageEventHandler(event)) {
        if (event.method === 'setValue')
            return `(...args) => ${event.namespace}.${event.method}(${event.params[0]}, ${event.params[1]})`;

        else
            return `()=> ${event.namespace}.${event.method}()`;
    }

    return null;
}

export function compilerEventHandlers(events: IEventHandler[]) {
    const result: {
        [key: string]: string[]
    } = {};
    events.forEach((item: IEventHandler) => {
        if ((item.namespace && item.method) || item.action === IEnumEventHandlerAction.RUN_FUNCTION) {
            const jsExpression = compilerEventHandler(item);
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
