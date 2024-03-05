import type { IPublicTypeCompositeValue, IPublicTypeJSSlot, IPublicTypeNodeData, IPublicTypeNodeSchema } from '@webank/letgo-types';
import { isJSExpression, isJSFunction, isJSSlot, isNodeSchema } from '@webank/letgo-types';
import { isPlainObject, isUndefined } from 'lodash-es';

export function traverseNodePropsSlot(value: IPublicTypeCompositeValue, callback: (key: string, jsSlot: IPublicTypeJSSlot) => void, parentPath?: number | string) {
    if (Array.isArray(value)) {
        value.map((item, index) => traverseNodePropsSlot(item, callback, isUndefined(parentPath) ? index : `${parentPath}_${index}`));
    }
    else if (!isJSSlot(value) && !isJSExpression(value) && !isJSFunction(value) && isPlainObject(value)) {
        return Object.keys(value).forEach((key) => {
            if (key !== 'children') {
                const data = value[key as keyof typeof value];
                if (isJSSlot(data))
                    callback(isUndefined(parentPath) ? key : `${parentPath}_${key}`, data);
                else if (typeof data === 'object')
                    traverseNodePropsSlot(data, callback, isUndefined(parentPath) ? key : `${parentPath}_${key}`);
            }
        });
    }
}

export function traverseNodeSchema(
    nodeData: IPublicTypeNodeData | IPublicTypeNodeData[],
    callback: (schema: IPublicTypeNodeSchema) => void,
) {
    if (Array.isArray(nodeData)) {
        nodeData.forEach((item) => {
            if (isNodeSchema(item)) {
                callback(item);
                traverseNodePropsSlot(item.props, (key: string, jsSlot: IPublicTypeJSSlot) => {
                    traverseNodeSchema(jsSlot.value, callback);
                });
                if (item.props.children) {
                    if (Array.isArray(item.props.children))
                        traverseNodeSchema(item.props.children, callback);

                    else
                        traverseNodeSchema([item.props.children], callback);
                }
                if (item.children)
                    traverseNodeSchema(item.children, callback);
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
        callback(nodeData);
        traverseNodePropsSlot(nodeData.props, (key: string, jsSlot: IPublicTypeJSSlot) => {
            traverseNodeSchema(jsSlot.value, callback);
        });
        if (nodeData.children)
            traverseNodeSchema(nodeData.children, callback);
    }
}
