import { defineComponent, PropType } from 'vue';
import {
    accordionFieldCls,
    inlineFieldCls,
    plainFieldCls,
    blockFieldCls,
    popupFieldCls,
    entryFieldCls,
    bodyCls,
    headerCls,
} from './fields.css';

export interface IFieldProps {
    name?: string;
    title?: string | null;
    display?: 'accordion' | 'inline' | 'block' | 'plain' | 'popup' | 'entry';
    collapsed?: boolean;
    valueState?: number;
    onExpandChange?: (expandState: boolean) => void;
    onClear?: () => void;
}

const fieldClsMap = {
    accordion: accordionFieldCls,
    inline: inlineFieldCls,
    plain: plainFieldCls,
    block: blockFieldCls,
    popup: popupFieldCls,
    entry: entryFieldCls,
};

export const PlainFieldView = defineComponent({
    name: 'PlainFieldView',
    render() {
        const { $slots } = this;
        return (
            <div class={plainFieldCls}>
                <div class={bodyCls}>{$slots.default?.()}</div>
            </div>
        );
    },
});

export const FieldView = defineComponent({
    name: 'FieldView',
    props: {
        display: {
            type: String as PropType<IFieldProps['display']>,
            default: 'inline',
        },
        title: String,
    },
    render() {
        const { display, title, $slots } = this;

        return (
            <div class={fieldClsMap[display]}>
                <div class={headerCls}>{title}</div>
                <div class={bodyCls}>{$slots.default?.()}</div>
            </div>
        );
    },
});
