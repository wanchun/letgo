import type {
    ICodeStruct,
    IEventHandler,
    IPublicTypeCompositeValue,
    IPublicTypeNodeData,
    IPublicTypeNodeSchema,
    IPublicTypeRootSchema,
} from '@webank/letgo-types';
import { IEnumEventHandlerAction, isJSExpression, isJSFunction, isJSSlot, isJavascriptComputed, isJavascriptFunction, isNodeSchema, isQueryResource, isRestQueryResource, isVariableState } from '@webank/letgo-types';
import { isPlainObject } from 'lodash-es';

type Callback = (code: string, parent: any) => void;

function handleEventDep(events: IEventHandler[], callback: Callback) {
    if (events) {
        for (const event of events) {
            if (event.params?.length) {
                for (const param of event.params)
                    callback(param, event);
            }
            if (event.action === IEnumEventHandlerAction.RUN_FUNCTION)
                callback(event.namespace, event);
        }
    }
}

function traverseCode(code: ICodeStruct, callback: Callback) {
    for (const item of code.code || []) {
        if (isVariableState(item)) {
            callback(item.initValue, item);
        }
        else if (isJavascriptComputed(item)) {
            callback(item.funcBody, item);
        }
        else if (isJavascriptFunction(item)) {
            callback(item.funcBody, item);
        }
        else if (isQueryResource(item)) {
            if (isRestQueryResource(item)) {
                callback(item.api, item);
                callback(item.params, item);
                if (item.transformer)
                    callback(item.transformer, item);
            }
            else {
                callback(item.query, callback);
            }

            handleEventDep(item.failureEvent, callback);
            handleEventDep(item.successEvent, callback);
        }
    }
}

function traverseNodeProps(value: IPublicTypeCompositeValue, callback: Callback) {
    if (Array.isArray(value)) {
        value.map(item => traverseNodeProps(item, callback));
    }
    else if (isJSExpression(value)) {
        callback(value.value, value);
    }
    else if (isJSFunction(value)) {
        callback(value.value, value);
    }
    else if (isJSSlot(value)) {
        traverseNodeSchema(value.value, callback);
    }
    else if (isPlainObject(value)) {
        return Object.keys(value).forEach((key) => {
            if (key !== 'children') {
                const data = value[key as keyof typeof value];
                if (isJSSlot(data))
                    traverseNodeSchema(data.value, data);
                else if (typeof data === 'object')
                    traverseNodeProps(data, callback);
            }
        });
    }
}

function handleNodeSchema(node: IPublicTypeNodeSchema, callback: Callback) {
    handleEventDep(node.events, callback);
    traverseNodeProps(node.props, callback);

    if (node.props.children)
        traverseNodeSchema(node.props.children, callback);

    if (node.children)
        traverseNodeSchema(node.children, callback);
}

function traverseNodeSchema(
    nodeData: IPublicTypeNodeData | IPublicTypeNodeData[],
    callback: Callback,
) {
    if (Array.isArray(nodeData)) {
        nodeData.forEach((item) => {
            if (isNodeSchema(item)) {
                handleNodeSchema(item, callback);
            }
            else if (isJSSlot(item)) {
                traverseNodeSchema(
                    Array.isArray(item.value) ? item.value : [item.value],
                    callback,
                );
            }
        });
    }
    else if (isNodeSchema(nodeData)) {
        handleNodeSchema(nodeData, callback);
    }
}

export function traverseLogic(rootSchema: IPublicTypeRootSchema, callback: Callback) {
    traverseCode(rootSchema.code, callback);

    traverseNodeSchema(rootSchema.children, callback);
}
