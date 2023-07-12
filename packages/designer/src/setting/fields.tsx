import type { PropType } from 'vue';
import { defineComponent, inject, ref } from 'vue';
import type { IPublicTypeDisplay, IPublicTypeNpmInfo } from '@harrywan/letgo-types';
import { EditOutlined, RightOutlined } from '@fesjs/fes-design/icon';
import { FDrawer } from '@fesjs/fes-design';

import {
    accordionFieldCls,
    blockFieldCls,
    bodyCls,
    headerCls,
    iconCls,
    iconShowCls,
    inlineFieldCls,
    plainFieldCls,
    popupContentCls,
    popupFieldCls,
} from './fields.css';

export interface IFieldProps {
    meta?: IPublicTypeNpmInfo | string
    name?: string
    title?: string | null
    display?: IPublicTypeDisplay
    expanded?: boolean
    valueState?: number
    onExpandChange?: (expandState: boolean) => void
    onClear?: () => void
}

const filedViewProps = {
    name: String,
    title: String,
    meta: [String, Object] as PropType<IPublicTypeNpmInfo | string>,
    expanded: Boolean,
    valueState: Number,
    onExpandChange: Function as PropType<(expandState: boolean) => void>,
    onClear: Function as PropType<() => void>,
};

function useId(props: IFieldProps) {
    const { meta, title, name: propName } = props;
    let hostName = '';
    if (typeof meta === 'object')
        hostName = `${meta?.package || ''}-${meta.exportName || ''}`;

    else if (typeof meta === 'string')
        hostName = meta;

    const id = `${hostName}-${propName || title}`;

    return id;
}

export const PopupFieldView = defineComponent({
    name: 'PopupFieldView',
    props: filedViewProps,
    setup(props, { slots }) {
        const id = useId(props);

        const popup: any = inject('popup');

        const showRef = ref(false);

        const toggle = () => {
            showRef.value = !showRef.value;
            if (showRef.value && popup.openPopup)
                popup.openPopup(props.title, slots.default?.());

            if (!showRef.value && popup.closePopup)
                popup.closePopup();
        };

        return () => {
            return (
                <div class={popupFieldCls} id={id} style={{ right: '400px' }}>
                    <div class={headerCls}>{props.title}</div>
                    <div class={bodyCls}>
                        <EditOutlined class={iconCls} onClick={toggle}/>
                    </div>
                    {
                        !popup.openPopup && (
                            <FDrawer
                                show={showRef.value}
                                title={props.title}
                                displayDirective="if"
                                mask={false}
                                width={400}
                                contentClass={popupContentCls}
                                onCancel={toggle}
                            >
                                {slots.default?.()}
                            </FDrawer>
                        )
                    }
                </div>
            );
        };
    },
});

export const PlainFieldView = defineComponent({
    name: 'PlainFieldView',
    props: filedViewProps,
    setup(props, { slots }) {
        const id = useId(props);

        return () => {
            return (
                <div class={plainFieldCls} id={id}>
                    <div class={bodyCls}>{slots.default?.()}</div>
                </div>
            );
        };
    },
});

export const AccordionFieldView = defineComponent({
    name: 'AccordionFieldView',
    props: filedViewProps,
    setup(props, { slots }) {
        const id = useId(props);

        const onClickHeader = () => {
            props?.onExpandChange(!props.expanded);
        };

        return () => {
            return (
                <div class={accordionFieldCls} id={id}>
                    <div class={headerCls} onClick={onClickHeader}>
                        <RightOutlined class={[iconCls, props.expanded && iconShowCls]}/>
                        <span>{props.title}</span>
                    </div>
                    <div class={bodyCls} v-show={props.expanded}>{slots.default?.()}</div>
                </div>
            );
        };
    },
});

export const BlockFieldView = defineComponent({
    name: 'BlockFieldView',
    props: filedViewProps,
    setup(props, { slots }) {
        const id = useId(props);

        return () => {
            return (
                <div class={blockFieldCls} id={id}>
                    <div class={headerCls}>{props.title}</div>
                    <div class={bodyCls}>{slots.default?.()}</div>
                </div>
            );
        };
    },
});

export const InlineFieldView = defineComponent({
    name: 'InlineFieldView',
    props: filedViewProps,
    setup(props, { slots }) {
        const id = useId(props);

        return () => {
            return (
                <div class={inlineFieldCls} id={id}>
                    <div class={headerCls}>{props.title}</div>
                    <div class={bodyCls}>{slots.default?.()}</div>
                </div>
            );
        };
    },
});
