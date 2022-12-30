import { defineComponent, PropType, onMounted, computed } from 'vue';
import { Setter, JSSlot } from '@webank/letgo-types';
import { isUndefined } from 'lodash-es';
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
        // TODO: 默认开启时处理 value
        const isOpenSlot = computed(() => {
            if (props.defaultValue) {
                const { value, visible } = props.defaultValue;
                if (value) {
                    if (visible === undefined) {
                        if (Array.isArray(value) && value.length == 0) {
                            return false;
                        } else if (value?.length > 0) {
                            return true;
                        }
                    } else {
                        return visible;
                    }
                }
            }
            return false;
        });

        const onChange = (checked: boolean) => {
            const { onChange } = props;
            if (checked) {
                onChange?.({
                    type: 'JSSlot',
                    value: null,
                });
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
