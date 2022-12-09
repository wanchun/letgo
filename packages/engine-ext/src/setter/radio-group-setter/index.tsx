import { defineComponent, computed, PropType } from 'vue';
import { Setter } from '@webank/letgo-types';
import { FRadioGroup, FRadio } from '@fesjs/fes-design';
import { commonProps } from '../../common/setter-props';

const RadioGroupSetterView = defineComponent({
    name: 'RadioGroupSetterView',
    props: {
        ...commonProps,
        value: [Number, String] as PropType<any>,
        defaultValue: [Number, String] as PropType<any>,
        options: {
            type: Array as PropType<any[]>,
            isRequired: true,
        },
        onChange: {
            type: Function as PropType<(val: string | number) => void>,
        },
    },
    setup(props) {
        const options = computed(() => {
            return props.options.map((item: any) => {
                return {
                    label: item.title || item.label || '-',
                    value: item.value,
                    disabled: item.disabled || false,
                };
            });
        });
        return () => {
            return (
                <FRadioGroup
                    modelValue={props.value}
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

export const RadioGroupSetter: Setter = {
    type: 'RadioGroupSetter',
    title: '单选设置器',
    Component: RadioGroupSetterView,
};
