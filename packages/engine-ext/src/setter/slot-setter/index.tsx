import { defineComponent, PropType, onMounted, computed } from 'vue';
import { Setter, JSSlot } from '@webank/letgo-types';
import { isUndefined, isNil } from 'lodash-es';
import { FSwitch } from '@fesjs/fes-design';
import { commonProps } from '../../common/setter-props';
import { wrapCls } from './index.css';

interface Template {
    // 模板标签
    label: string;
    // 模板ID
    value: string;
    // 模板内容
    content: object;
}

type ValueType = JSSlot & { visible: boolean; title: string };

const SlotSetterView = defineComponent({
    name: 'SlotSetterView',
    props: {
        ...commonProps,
        value: Object as PropType<ValueType>,
        defaultValue: Object as PropType<ValueType>,
        supportParams: Boolean,
        templates: Object as PropType<Template[]>,
        onChange: Function as PropType<(val: any) => void>,
    },
    setup(props) {
        const isOpenSlot = computed(() => {
            if (props.value) {
                const { value, visible } = props.value;
                if (value) {
                    if (visible === undefined) {
                        if (Array.isArray(value) && value.length == 0) {
                            return false;
                        } else if (Array.isArray(value) && value?.length > 0) {
                            return true;
                        } else {
                            return !isNil(value);
                        }
                    } else {
                        return visible;
                    }
                }
            }
            return false;
        });

        const onChange = (checked: boolean) => {
            const { onChange, defaultValue } = props;
            if (checked) {
                onChange?.(
                    defaultValue ?? {
                        type: 'JSSlot',
                        value: null,
                    },
                );
            } else {
                onChange?.();
            }
        };

        onMounted(() => {
            props.onMounted?.();
        });

        return () => {
            return (
                <div class={wrapCls}>
                    <FSwitch
                        modelValue={
                            isUndefined(props.value)
                                ? isOpenSlot.value
                                : !!props.value
                        }
                        onChange={(val: any) => {
                            onChange(val);
                        }}
                    >
                        {{ active: () => '启用', inactive: () => '关闭' }}
                    </FSwitch>
                </div>
            );
        };
    },
});

export const SlotSetter: Setter = {
    type: 'SlotSetter',
    title: '插槽设置器',
    Component: SlotSetterView,
};
