import { computed, defineComponent, onMounted } from 'vue';
import type { IPublicTypeSetter } from '@harrywan/letgo-types';
import type { SettingField } from '@harrywan/letgo-designer';
import { isNumber, isUndefined } from 'lodash-es';
import { FInputNumber } from '@fesjs/fes-design';
import { commonProps } from '../../common';

const NumberSetterView = defineComponent({
    name: 'NumberSetterView',
    props: {
        ...commonProps,
        value: Number,
        defaultValue: Number,
    },
    setup(props) {
        onMounted(() => {
            props.onMounted?.();
        });
        const currentValue = computed(() => {
            if (isNumber(props.value))
                return props.value;

            else if (isNumber(props.defaultValue))
                return props.defaultValue;

            return null;
        });
        return () => {
            return (
                <FInputNumber
                    modelValue={currentValue.value}
                    placeholder={props.placeholder || ''}
                    onChange={(val: any) => props.onChange(val)}
                    style={{ width: '100%' }}
                />
            );
        };
    },
});

export const NumberSetter: IPublicTypeSetter = {
    type: 'NumberSetter',
    title: '数字设置器',
    Component: NumberSetterView,
    condition: (field) => {
        const v = field.getValue() ?? (field as SettingField).getDefaultValue();
        return isUndefined(v) || typeof v === 'number';
    },
};
