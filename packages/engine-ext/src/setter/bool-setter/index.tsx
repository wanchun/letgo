import { defineComponent, onMounted } from 'vue';
import { Setter } from '@webank/letgo-types';
import { FSwitch } from '@fesjs/fes-design';
import { commonProps } from '../../common/setter-props';

const BoolSetterView = defineComponent({
    name: 'BoolSetterView',
    props: {
        ...commonProps,
        value: Boolean,
        defaultValue: Boolean,
    },
    setup(props) {
        onMounted(() => {
            props.onMounted?.();
        });
        return () => {
            return (
                <FSwitch
                    modelValue={props.value}
                    onChange={(val: any) => props.onChange(val)}
                />
            );
        };
    },
});

export const BoolSetter: Setter = {
    type: 'BoolSetter',
    title: '布尔类型设置器',
    Component: BoolSetterView,
};
