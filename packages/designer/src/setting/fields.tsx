import { FTooltip } from '@fesjs/fes-design';
import { EditOutlined, QuestionCircleOutlined, RightOutlined } from '@fesjs/fes-design/icon';
import type { IPublicTypeFieldDisplay, IPublicTypeNpmInfo } from '@webank/letgo-types';
import type { PropType } from 'vue';
import { defineComponent, ref } from 'vue';
import { usePopupManage } from './usePopup';

import './fields.less';

export interface IFieldProps {
    meta?: IPublicTypeNpmInfo | string;
    name?: string;
    title?: string | null;
    description?: string;
    display?: IPublicTypeFieldDisplay;
    expanded?: boolean;
    valueState?: number;
    onExpandChange?: (expandState: boolean) => void;
    onClear?: () => void;
}

const filedViewProps = {
    name: String,
    title: String,
    description: String,
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

function renderFieldDescView(desc: string) {
    if (!desc)
        return;
    const slots = {
        default: () => <QuestionCircleOutlined color="var(--f-primary-color)" style="margin-left: 3px;"></QuestionCircleOutlined>,
        content: () => <pre style="margin: 0;">{desc}</pre>
    }
    return <FTooltip v-slots={slots}></FTooltip>;
}

export const PopupFieldView = defineComponent({
    name: 'PopupFieldView',
    props: filedViewProps,
    setup(props, { slots }) {
        const id = useId(props);

        const popup = usePopupManage();

        const showRef = ref(false);

        const toggle = () => {
            showRef.value = !showRef.value;
            if (showRef.value && popup.openPopup) {
                popup.openPopup(props.title, slots.default?.(), () => {
                    showRef.value = !showRef.value;
                });
            }
        };

        return () => {
            return (
                <div class="letgo-designer-setting__popup-field" id={id}>
                    <div class="letgo-designer-setting__header">
                        {props.title}
                        {renderFieldDescView(props.description)}
                    </div>
                    <div class="letgo-designer-setting__body">
                        <EditOutlined class="letgo-designer-setting__icon" onClick={toggle} />
                    </div>
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
                <div class="letgo-designer-setting__plain-field" id={id}>
                    <div class="letgo-designer-setting__body">{slots.default?.()}</div>
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
                <div class="letgo-designer-setting__accordion-field" id={id}>
                    <div class="letgo-designer-setting__header" onClick={onClickHeader}>
                        <RightOutlined class={['letgo-designer-setting__icon', props.expanded && 'letgo-designer-setting__icon--show']} />
                        <span>{props.title}</span>
                        {renderFieldDescView(props.description)}
                    </div>
                    <div class="letgo-designer-setting__body" v-show={props.expanded}>{slots.default?.()}</div>
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
                <div class="letgo-designer-setting__field" id={id}>
                    <div class="letgo-designer-setting__header">
                        {props.title}
                        {renderFieldDescView(props.description)}
                    </div>
                    <div class="letgo-designer-setting__body">{slots.default?.()}</div>
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
                <div class="letgo-designer-setting__inline-field" id={id}>
                    <div class="letgo-designer-setting__header">
                        {props.title}
                        {renderFieldDescView(props.description)}
                    </div>
                    <div class="letgo-designer-setting__body">{slots.default?.()}</div>
                </div>
            );
        };
    },
});
