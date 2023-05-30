import type { PropType } from 'vue';
import { computed, defineComponent, onMounted } from 'vue';
import { isJSExpression } from '@webank/letgo-types';
import type { IPublicTypeCompositeValue, IPublicTypeSetter } from '@webank/letgo-types';
import { FInput } from '@fesjs/fes-design';
import { commonProps } from '../../common';

const VariableSetterView = defineComponent({
    name: 'VariableSetterView',
    props: {
        ...commonProps,
        value: [Object, String, Number, Array, Boolean] as PropType<IPublicTypeCompositeValue>,
        defaultValue: [Object, String, Number, Array, Boolean] as PropType<IPublicTypeCompositeValue>,
    },
    setup(props) {
        onMounted(() => {
            props.onMounted?.();
        });
        const currentValue = computed(() => {
            if (!isJSExpression(props.value)) {
                if (isJSExpression(props.defaultValue))
                    return props.defaultValue.value;
                return '';
            }
            return props.value.value;
        });
        const currentMock = computed(() => {
            if (isJSExpression(props.value))
                return props.value.mock;

            if (isJSExpression(props.defaultValue))
                return props.defaultValue.mock;

            return null;
        });
        const changeValue = (val: string) => {
            props.onChange({
                type: 'JSExpression',
                value: val,
                mock: currentMock.value,
            });
        };
        return () => {
            return (
                <FInput
                    modelValue={currentValue.value}
                    placeholder={props.placeholder || ''}
                    onChange={changeValue}
                    style={{ width: '100%' }}
                />
            );
        };
    },
});

export const VariableSetter: IPublicTypeSetter = {
    type: 'VariableSetter',
    title: '变量设置器',
    Component: VariableSetterView,
};
