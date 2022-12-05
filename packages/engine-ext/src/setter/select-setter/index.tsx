import { computed, defineComponent, PropType } from 'vue';
import { Setter } from '@webank/letgo-types';
import { FSelect } from '@fesjs/fes-design';

const SelectSetterView = defineComponent({
    name: 'SelectSetterView',
    props: {
        value: [String, Number] as PropType<any>,
        defaultValue: [String, Number] as PropType<any>,
        options: {
            type: Array as PropType<any[]>,
            isRequired: true,
        },
        placeholder: String,
        filterable: Boolean,
        onChange: {
            type: Function as PropType<(val: number | string) => void>,
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
                <FSelect
                    modelValue={props.value}
                    placeholder={props.placeholder || ''}
                    options={options.value}
                    filterable={props.filterable}
                    onChange={(val: any) => props.onChange(val)}
                    style={{ width: '100%' }}
                />
            );
        };
    },
});

export const SelectSetter: Setter = {
    type: 'SelectSetter',
    title: '选择设置器',
    Component: SelectSetterView,
};
