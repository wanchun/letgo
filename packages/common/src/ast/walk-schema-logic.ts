import type {
    ICodeItem,
    ICodeStruct,
    IEventHandler,
    IPublicTypeCompositeValue,
    IPublicTypeNodeData,
    IPublicTypeNodeSchema,
    IPublicTypeRootSchema,
} from '@webank/letgo-types';
import { IEnumRunScript, isJSExpression, isJSFunction, isJSSlot, isJavascriptComputed, isJavascriptFunction, isNodeSchema, isQueryResource, isRestQueryResource, isRunFunctionEventHandler, isVariableState } from '@webank/letgo-types';
import { isPlainObject } from 'lodash-es';

type Callback = (code: string, parent: any, type: 'JSFunction' | 'JSExpression') => void;

function handleEventDep(events: IEventHandler[], callback: Callback) {
    if (events) {
        for (const event of events) {
            if (isRunFunctionEventHandler(event)) {
                if (event.type === IEnumRunScript.PLAIN) {
                    callback(event.funcBody, event, 'JSFunction');
                    continue;
                }
            }
            if (event.params?.length) {
                for (const param of event.params)
                    callback(param, event, 'JSExpression');
            }
            callback(event.namespace, event, 'JSExpression');
        }
    }
}

export function traverseCodes(code: ICodeItem[], callback: Callback) {
    for (const item of code || []) {
        if (isVariableState(item)) {
            callback(item.initValue, item, 'JSExpression');
        }
        else if (isJavascriptComputed(item)) {
            callback(item.funcBody, item, 'JSFunction');
        }
        else if (isJavascriptFunction(item)) {
            callback(item.funcBody, item, 'JSFunction');
        }
        else if (isQueryResource(item)) {
            if (isRestQueryResource(item)) {
                callback(item.api, item, 'JSExpression');
                callback(item.params, item, 'JSExpression');
                if (item.transformer)
                    callback(item.transformer, item, 'JSFunction');
            }
            else {
                callback(item.query, callback, 'JSFunction');
            }

            handleEventDep(item.failureEvent, callback);
            handleEventDep(item.successEvent, callback);
        }
    }
}

export function traverseCodeStruct(code: ICodeStruct, callback: Callback) {
    if (!code)
        return;
    traverseCodes(code.code, callback);
    for (const directory of code.directories)
        traverseCodes(directory.code, callback);
}

function traverseNodeProps(value: IPublicTypeCompositeValue, callback: Callback) {
    if (Array.isArray(value)) {
        value.map(item => traverseNodeProps(item, callback));
    }
    else if (isJSExpression(value)) {
        callback(value.value, value, 'JSExpression');
    }
    else if (isJSFunction(value)) {
        callback(value.value, value, 'JSFunction');
    }
    else if (isJSSlot(value)) {
        traverseNodeSchemaLogic(value.value, callback);
    }
    else if (isPlainObject(value)) {
        return Object.keys(value).forEach((key) => {
            if (key !== 'children') {
                const data = value[key as keyof typeof value];
                if (isJSSlot(data))
                    traverseNodeSchemaLogic(data.value, callback);
                else if (typeof data === 'object')
                    traverseNodeProps(data, callback);
            }
        });
    }
}

function handleNodeSchema(node: IPublicTypeNodeSchema, callback: Callback) {
    handleEventDep(node.events, callback);
    traverseNodeProps(node.props, callback);
    if (isJSExpression(node.condition))
        callback(node.condition.value, node.condition, 'JSExpression');

    if (node.props.children)
        traverseNodeSchemaLogic(node.props.children, callback);

    if (node.children)
        traverseNodeSchemaLogic(node.children, callback);
}

export function traverseNodeSchemaLogic(
    nodeData: IPublicTypeNodeData | IPublicTypeNodeData[],
    callback: Callback,
) {
    if (Array.isArray(nodeData)) {
        nodeData.forEach((item) => {
            if (isNodeSchema(item)) {
                handleNodeSchema(item, callback);
            }
            else if (isJSSlot(item)) {
                traverseNodeSchemaLogic(
                    Array.isArray(item.value) ? item.value : [item.value],
                    callback,
                );
            }
        });
    }
    else if (isNodeSchema(nodeData)) {
        handleNodeSchema(nodeData, callback);
    }
    else if (isJSExpression(nodeData)) {
        callback(nodeData.value, nodeData, 'JSExpression');
    }
}

export function walkSchemaLogic(rootSchema: IPublicTypeRootSchema, callback: Callback) {
    traverseCodeStruct(rootSchema.code, callback);

    traverseNodeSchemaLogic(rootSchema.children, callback);
}
