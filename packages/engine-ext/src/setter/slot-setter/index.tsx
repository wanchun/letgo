import type { PropType } from 'vue';
import { computed, defineComponent, onMounted } from 'vue';
import { isJSSlot } from '@webank/letgo-types';
import type { IPublicTypeJSSlot, IPublicTypeSetter } from '@webank/letgo-types';
import type { SettingField } from '@webank/letgo-designer';
import { isNil, isUndefined } from 'lodash-es';
import { FSwitch } from '@fesjs/fes-design';
import { commonProps } from '../../common';

interface Template {
    // 模板标签
    label: string
    // 模板ID
    value: string
    // 模板内容
    content: object
}

type ValueType = IPublicTypeJSSlot & { visible: boolean; title: string };

const SlotSetterView = defineComponent({
    name: 'SlotSetterView',
    props: {
        ...commonProps,
        value: Object as PropType<ValueType>,
        defaultValue: Object as PropType<ValueType>,
        supportParams: Boolean,
        templates: Object as PropType<Template[]>,
        onChange: Function as PropType<(val?: any) => void>,
    },
    setup(props) {
        const isOpenSlot = computed(() => {
            if (props.value) {
                const { value, visible } = props.value;
                if (value) {
                    if (visible === undefined) {
                        if (Array.isArray(value) && value.length == 0)
                            return false;

                        else if (Array.isArray(value) && value?.length > 0)
                            return true;

                        else
                            return !isNil(value);
                    }
                    else {
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
            }
            else {
                onChange?.();
            }
        };

        onMounted(() => {
            props.onMounted?.();
        });

        return () => {
            return (
                <div>
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

export const SlotSetter: IPublicTypeSetter = {
    type: 'SlotSetter',
    title: '插槽设置器',
    Component: SlotSetterView,
    condition: (field) => {
        const v = field.getValue() ?? (field as SettingField).getDefaultValue();
        return isJSSlot(v);
    },
};
