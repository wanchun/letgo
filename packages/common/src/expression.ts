import type { IPublicTypeEventHandler, IPublicTypeJSFunction } from '@webank/letgo-types';
import {
    EventHandlerAction,
} from '@webank/letgo-types';

export const EXPRESSION_REGEX = /{{(.*?)}}/;

export function hasExpression(doc: string) {
    return EXPRESSION_REGEX.test(doc);
}

export function eventHandlerToJsExpression(item: IPublicTypeEventHandler): IPublicTypeJSFunction {
    let expression: string;
    const params: string[] = [];
    if (item.action === EventHandlerAction.CONTROL_QUERY) {
        expression = `${item.callId}.${item.method}()`;
    }
    else if (item.action === EventHandlerAction.CONTROL_COMPONENT) {
        // TODO 支持参数
        expression = `${item.callId}.${item.method}()`;
    }
    else if (item.action === EventHandlerAction.GO_TO_URL) {
        params.push(item.url);
        expression = `${item.callId}.${item.method}.apply(${item.callId}, Array.prototype.slice.call(arguments))')`;
    }
    else if (item.action === EventHandlerAction.GO_TO_PAGE) {
        // TODO 支持参数
        expression = `${item.callId}.${item.method}('${item.pageId}')`;
    }
    else if (item.action === EventHandlerAction.SET_TEMPORARY_STATE) {
        // TODO 支持其他方法
        params.push(item.value);
        expression = `${item.callId}.${item.method}.apply(${item.callId}, Array.prototype.slice.call(arguments))`;
    }
    else if (item.action === EventHandlerAction.SET_LOCAL_STORAGE) {
        // TODO 支持其他方法
        if (item.method === 'setValue') {
            params.push(item.key, item.value);
            expression = `${item.callId}.${item.method}.apply(null, Array.prototype.slice.call(arguments))`;
        }
        else {
            expression = `${item.callId}.${item.method}()`;
        }
    }

    return {
        type: 'JSFunction',
        // 需要传下入参
        value: `function(){${expression}}`,
        params,
    };
}

export function eventHandlersToJsExpression(handlers: IPublicTypeEventHandler[]) {
    const result: {
        [key: string]: IPublicTypeJSFunction[]
    } = {};
    handlers.forEach((item: IPublicTypeEventHandler) => {
        if (item.callId && item.method) {
            const jsExpression = eventHandlerToJsExpression(item);
            result[item.name] = (result[item.name] || []).concat(jsExpression);
        }
    });
    return result;
}
