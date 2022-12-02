import { defineComponent, onMounted } from 'vue';
import { Setter } from '@webank/letgo-types';
import { FInputNumber } from '@fesjs/fes-design';

interface NumberSetterProps {
    value?: number;
    defaultValue?: number;
    placeholder?: string;
    onMounted?: () => void;
    onChange: (val: string) => void;
}

const NumberSetterView = defineComponent<NumberSetterProps>((props) => {
    onMounted(() => {
        props.onMounted?.();
    });
    return () => {
        return (
            <FInputNumber
                modelValue={props.value}
                placeholder={props.placeholder || ''}
                onChange={(val: any) => props.onChange(val)}
                style={{ width: '100%' }}
            />
        );
    };
});

export const NumberSetter: Setter = {
    type: 'NumberSetter',
    title: '数字设置器',
    Component: NumberSetterView,
    tester: (scheme) => {
        return scheme.propType === 'number';
    },
};
