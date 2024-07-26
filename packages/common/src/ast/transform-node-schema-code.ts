import type {
    IEventHandler,
    IPublicTypeCompositeValue,
    IPublicTypeNodeData,
    IPublicTypeNodeSchema,
    IPublicTypeRootSchema,
} from '@webank/letgo-types';
import {
    IEnumRunScript,
    isJSExpression,
    isJSFunction,
    isJSSlot,
    isNodeSchema,
    isRunFunctionEventHandler,
} from '@webank/letgo-types';
import { isPlainObject } from 'lodash-es';

type Callback = (code: string, parent: any, type: 'JSFunction' | 'JSExpression') => string;

function handleEventDep(events: IEventHandler[], callback: Callback) {
    if (events) {
        for (const event of events) {
            if (isRunFunctionEventHandler(event)) {
                if (event.namespace)
                    event.namespace = callback(event.namespace, event, 'JSExpression');

                if (event.type === IEnumRunScript.PLAIN) {
                    event.funcBody = callback(event.funcBody, event, 'JSFunction');
                    continue;
                }
            }
            if (event.params?.length) {
                event.params = event.params.map((item) => {
                    return callback(item, event, 'JSExpression');
                });
            }
        }
    }
}

function traverseNodeProps(value: IPublicTypeCompositeValue, callback: Callback) {
    if (Array.isArray(value)) {
        value.map(item => traverseNodeProps(item, callback));
    }
    else if (isJSExpression(value)) {
        value.value = callback(value.value, value, 'JSExpression');
    }
    else if (isJSFunction(value)) {
        value.value = callback(value.value, value, 'JSFunction');
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
        node.condition = callback(node.condition.value, node.condition, 'JSExpression');

    if (isJSExpression(node.loop))
        node.loop.value = callback(node.loop.value, node.loop, 'JSExpression');

    if (node.props.children)
        traverseNodeSchemaLogic(node.props.children, callback);

    if (node.children)
        traverseNodeSchemaLogic(node.children, callback);
}

function traverseNodeSchemaLogic(
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
        nodeData.value = callback(nodeData.value, nodeData, 'JSExpression');
    }
}

export function transformNodeSchemaCode(rootSchema: IPublicTypeRootSchema, callback: Callback) {
    traverseNodeSchemaLogic(rootSchema.children, callback);
}
