import { defineComponent, onMounted } from 'vue';
import type { IPublicTypeSetter } from '@webank/letgo-types';
import { FInput } from '@fesjs/fes-design';
import { commonProps } from '../../common';

const VariableSetterView = defineComponent({
    name: 'VariableSetterView',
    props: {
        ...commonProps,
        value: String,
        defaultValue: String,
    },
    setup(props) {
        onMounted(() => {
            props.onMounted?.();
        });
        return () => {
            return (
                <FInput
                    // onInput={(val: any) => props.onChange(val)}
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
