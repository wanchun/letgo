import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import type { IPublicTypeSetter } from '@webank/letgo-types';
import { isUndefined } from 'lodash-es';
import { FRadio, FRadioGroup } from '@fesjs/fes-design';
import { commonProps } from '../../common';

type ValueType = number | string | boolean;

interface Option {
    label: string
    value: ValueType
    disabled?: boolean
    [key: string]: any
}

const RadioGroupSetterView = defineComponent({
    name: 'RadioGroupSetterView',
    props: {
        ...commonProps,
        value: [Number, String, Boolean] as PropType<ValueType>,
        defaultValue: [Number, String, Boolean] as PropType<ValueType>,
        options: {
            type: Array as PropType<Option[]>,
            isRequired: true,
        },
        onChange: {
            type: Function as PropType<(val: ValueType) => void>,
        },
    },
    setup(props) {
        const options = computed(() => {
            return props.options.map((item: any) => {
                return {
                    label: item.title || item.label || '-',
                    value: item.value,
                    disabled: item.disabled ?? false,
                };
            });
        });
        return () => {
            return (
                <FRadioGroup
                    modelValue={
                        isUndefined(props.value)
                            ? props.defaultValue
                            : props.value
                    }
                    onChange={(val: any) => props.onChange(val)}
                >
                    {options.value.map((item) => {
                        return (
                            <FRadio
                                value={item.value}
                                label={item.label}
                            ></FRadio>
                        );
                    })}
                </FRadioGroup>
            );
        };
    },
});

RadioGroupSetterView.name = 'RadioGroupSetterView';

export const RadioGroupSetter: IPublicTypeSetter = {
    type: 'RadioGroupSetter',
    title: '单选设置器',
    Component: RadioGroupSetterView,
};
