import type { PropType } from 'vue';
import { computed, defineComponent, onMounted } from 'vue';
import { isJSExpression } from '@webank/letgo-types';
import type { IPublicTypeCompositeValue, IPublicTypeSetter } from '@webank/letgo-types';
import { FSelect } from '@fesjs/fes-design';
import { getAllMethodAndProperties, isReactiveClassProp } from '@webank/letgo-common';
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
            const classInstance = props.node.document.state.classInstance;
            let variables: { label: string; value: string }[] = [];
            if (classInstance) {
                variables = getAllMethodAndProperties(classInstance).filter((member) => {
                    return isReactiveClassProp(classInstance, member);
                }).map((member) => {
                    return {
                        label: `this.${member}`,
                        value: `this.${member}`,
                    };
                });
            }
            return variables.concat(props.node.document.code.temporaryStates.map((item) => {
                return {
                    label: item.id,
                    value: `${item.id}.value`,
                };
            }).concat(props.node.document.project.code.temporaryStates.map((item) => {
                return {
                    label: item.id,
                    value: `${item.id}.value`,
                };
            })));
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
        const v = field.getValue() ?? (field).getDefaultValue();
        return isJSExpression(v) && v.value?.endsWith('.value');
    },
};
