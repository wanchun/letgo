import type { PropType } from 'vue';
import { computed, defineComponent, onMounted } from 'vue';
import { isJSExpression } from '@webank/letgo-types';
import type { SettingField } from '@webank/letgo-designer';
import type { IPublicTypeCompositeValue, IPublicTypeSetter } from '@webank/letgo-types';
import { FSelect } from '@fesjs/fes-design';
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
        const stateOptions = computed(() => {
            return props.node.document.code.temporaryStates.map((item) => {
                return {
                    label: item.id,
                    value: `${item.id}.value`,
                };
            });
        });
        const currentValue = computed(() => {
            let val: string;
            if (!isJSExpression(props.value)) {
                if (isJSExpression(props.defaultValue))
                    val = props.defaultValue.value;
            }
            else {
                val = props.value.value;
            }
            return val;
        });
        const changeValue = (val: string) => {
            props.onChange({
                type: 'JSExpression',
                value: val,
            });
        };
        return () => {
            return (
                <FSelect
                    modelValue={currentValue.value}
                    placeholder={props.placeholder || '选择变量'}
                    options={stateOptions.value}
                    onChange={changeValue}
                    style={{ width: '100%' }}
                    clearable={true}
                />
            );
        };
    },
});

export const VariableSetter: IPublicTypeSetter = {
    type: 'VariableSetter',
    title: '变量设置器',
    Component: VariableSetterView,
    condition: (field) => {
        const v = field.getValue() ?? (field as SettingField).getDefaultValue();
        return isJSExpression(v);
    },
};
