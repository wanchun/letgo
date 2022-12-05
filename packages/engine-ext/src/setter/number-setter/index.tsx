import { defineComponent, onMounted, PropType } from 'vue';
import { Setter } from '@webank/letgo-types';
import { FInputNumber } from '@fesjs/fes-design';

const NumberSetterView = defineComponent({
    name: 'NumberSetterView',
    props: {
        value: Number,
        defaultValue: Number,
        placeholder: String,
        onMounted: Function as PropType<() => void>,
        onChange: Function as PropType<(val: number) => void>,
    },
    setup(props) {
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
    },
});

export const NumberSetter: Setter = {
    type: 'NumberSetter',
    title: '数字设置器',
    Component: NumberSetterView,
    tester: (scheme) => {
        return scheme.propType === 'number';
    },
};
