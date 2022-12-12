import { defineComponent, onMounted } from 'vue';
import { Setter } from '@webank/letgo-types';
import { FInputNumber } from '@fesjs/fes-design';
import { commonProps } from '../../common/setter-props';

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
    condition: (field) => {
        const v = field.getValue();
        return typeof v === 'number';
    },
    tester: (scheme) => {
        return scheme.propType === 'number';
    },
};
