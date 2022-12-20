import { computed, defineComponent, PropType } from 'vue';
import { Setter } from '@webank/letgo-types';
import { isUndefined } from 'lodash-es';
import { FSelect } from '@fesjs/fes-design';
import { commonProps } from '../../common/setter-props';

const SelectSetterView = defineComponent({
    name: 'SelectSetterView',
    props: {
        ...commonProps,
        options: {
            type: Array as PropType<any[]>,
            isRequired: true,
        },
        filterable: Boolean,
        value: [String, Number] as PropType<any>,
        defaultValue: [String, Number] as PropType<any>,
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
                    modelValue={
                        isUndefined(props.value)
                            ? props.defaultValue
                            : props.value
                    }
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
