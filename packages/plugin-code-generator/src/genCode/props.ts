import { IPublicTypePropsMap, isJSExpression, isJSFunction } from '@webank/letgo-types';

// TODO 支持更多类型
export function compileProps(props?: IPublicTypePropsMap) {
    if (!props) {
        return [];
    }

    return Object.keys(props)
        .filter((key) => {
            // children 走 components 编辑
            return key !== 'children';
        })
        .map((key) => {
            const propValue = props[key];
            if (typeof propValue === 'number') {
                return `:${key}="${propValue}"`;
            }
            if (typeof propValue === 'boolean') {
                if (propValue) {
                    return key;
                }
                return `:${key}="false"`;
            }
            if (propValue == null) {
                return '';
            }
            if (typeof propValue === 'string') {
                return `${key}="${propValue}"`;
            }
            if (isJSExpression(propValue) || isJSFunction(propValue)) {
                return `:${key}="${propValue.value}"`;
            }
            if (propValue) {
                return `:${key}="${JSON.stringify(propValue)}"`;
            }
            return '';
        });
}
