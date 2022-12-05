import { defineComponent, onMounted, PropType } from 'vue';
import { Setter } from '@webank/letgo-types';
import { FSwitch } from '@fesjs/fes-design';

const BoolSetterView = defineComponent({
    name: 'BoolSetterView',
    props: {
        value: Boolean,
        defaultValue: Boolean,
        onMounted: Function as PropType<() => void>,
        onChange: Function as PropType<(val: boolean) => void>,
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
    tester: (scheme) => {
        return scheme.propType === 'bool';
    },
};
