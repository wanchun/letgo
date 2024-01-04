import type { PropType } from 'vue';
import { computed, defineComponent, onMounted } from 'vue';
import { debounce, isNil } from 'lodash-es';
import { isJSExpression } from '@webank/letgo-types';
import { ExpressionEditor } from '@webank/letgo-components';
import type { IPublicTypeCompositeValue, IPublicTypeSetter } from '@webank/letgo-types';
import { formatExpression } from '@webank/letgo-common';
import { commonProps } from '../../common';

const ExpressionSetterView = defineComponent({
    name: 'ExpressionSetterView',
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
            if (isNil(val) || val === '') {
                props.onChange(undefined);
                return;
            }
            props.onChange({
                type: 'JSExpression',
                value: val,
                mock: currentMock.value,
            });
        };
        const onBlur = async (val: string) => {
            val = await formatExpression(val);
            changeValue(val);
        };
        return () => {
            return (
                <ExpressionEditor doc={currentValue.value} onChangeDoc={debounce(changeValue, 500)} onBlur={onBlur} />
            );
        };
    },
});

export const ExpressionSetter: IPublicTypeSetter = {
    type: 'ExpressionSetter',
    title: '表达式设置器',
    Component: ExpressionSetterView,
    condition: (field) => {
        const v = field.getValue() ?? field.getDefaultValue();
        return isJSExpression(v);
    },
};
