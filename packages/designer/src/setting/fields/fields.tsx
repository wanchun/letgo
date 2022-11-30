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
    titleCls,
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

export const PlainField = defineComponent({
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

export const Field = defineComponent({
    name: 'FieldView',
    props: {
        field: Object as PropType<IFieldProps>,
    },
    render() {
        const { field, $slots } = this;
        const { display, title } = field as IFieldProps;

        return (
            <div class={fieldClsMap[display]}>
                <div class={headerCls}>
                    <div class={titleCls}>{title}</div>
                </div>
                <div class={bodyCls}>{$slots.default?.()}</div>
            </div>
        );
    },
});
