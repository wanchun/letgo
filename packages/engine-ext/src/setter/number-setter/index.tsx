import { defineComponent, onMounted } from 'vue';
import { IPublicTypeSetter } from '@webank/letgo-types';
import { isUndefined } from 'lodash-es';
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
        return () => {
            return (
                <FInputNumber
                    modelValue={
                        isUndefined(props.value)
                            ? props.defaultValue
                            : props.value
                    }
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
        const v = field.getValue();
        return typeof v === 'number';
    },
};
