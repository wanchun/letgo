import { h } from 'vue';
import { IFieldProps, FieldView, PlainFieldView } from './fields';

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
        return h(PlainFieldView, children);
    }
    return h(FieldView, { ...props, display: type }, () => children);
}

export { FieldView };
