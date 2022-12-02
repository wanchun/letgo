import { computed, defineComponent } from 'vue';
import { Setter } from '@webank/letgo-types';
import { FSelect } from '@fesjs/fes-design';

interface SelectSetterProps {
    value?: any;
    defaultValue?: any;
    placeholder?: string;
    onChange: (val: string) => void;
    options: any[];
    filterable?: boolean;
}

const SelectSetterView = defineComponent<SelectSetterProps>((props) => {
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
});

export const SelectSetter: Setter = {
    type: 'SelectSetter',
    title: '选择设置器',
    Component: SelectSetterView,
};
