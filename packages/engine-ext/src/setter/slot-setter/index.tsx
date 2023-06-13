import type { PropType } from 'vue';
import { computed, defineComponent, onMounted } from 'vue';
import { isJSSlot } from '@webank/letgo-types';
import type { IPublicTypeJSSlot, IPublicTypeSetter } from '@webank/letgo-types';
import type { SettingField } from '@webank/letgo-designer';
import { isNil, isUndefined } from 'lodash-es';
import { FSwitch } from '@fesjs/fes-design';
import { commonProps } from '../../common';

type ValueType = IPublicTypeJSSlot & { visible: boolean; title: string };

const SlotSetterView = defineComponent({
    name: 'SlotSetterView',
    props: {
        ...commonProps,
        value: Object as PropType<ValueType>,
        defaultValue: Object as PropType<ValueType>,
        onChange: Function as PropType<(val?: IPublicTypeJSSlot) => void>,
    },
    setup(props) {
        const isOpenSlot = computed(() => {
            if (props.value) {
                const { value, visible } = props.value;
                if (value) {
                    if (visible === undefined) {
                        if (Array.isArray(value) && value.length === 0)
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
            const { onChange, defaultValue, field } = props;
            if (checked) {
                const value: IPublicTypeJSSlot = defaultValue ?? {
                    type: 'JSSlot',
                    value: null,
                };
                if (isNil(value.title))
                    value.title = field.title;

                if (isNil(value.name))
                    value.name = `${field.name}`;

                onChange?.(value);
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
        return isUndefined(v) || isJSSlot(v);
    },
};
