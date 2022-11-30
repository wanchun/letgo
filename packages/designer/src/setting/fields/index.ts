import { h } from 'vue';
import { IFieldProps, Field, PlainField } from './fields';

export function createFieldContent(
    props: IFieldProps,
    children: any[],
    type?: 'accordion' | 'inline' | 'block' | 'plain' | 'popup' | 'entry',
) {
    // if (type === 'popup') {
    //     return createVNode(PopupField, props, children);
    // }
    // if (type === 'entry') {
    //     return createVNode(EntryField, props, children);
    // }
    if (type === 'plain' || !props.title) {
        return h(PlainField, children);
    }
    return h(Field, { field: { ...props, display: type } }, children);
}

export { Field };
