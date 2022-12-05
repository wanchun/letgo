import { defineComponent, onMounted, PropType } from 'vue';
import { Setter } from '@webank/letgo-types';
import { Sketch } from '@ckpack/vue-color';

const ColorSetterView = defineComponent({
    name: 'ColorSetterView',
    props: {
        value: String,
        defaultValue: String,
        onMounted: Function as PropType<() => void>,
        onChange: Function as PropType<(val: string) => void>,
    },
    setup(props) {
        onMounted(() => {
            props.onMounted?.();
        });
        return () => {
            return (
                <Sketch
                    modelValue={props.value}
                    onUpdate:modelValue={(val: any) => props.onChange(val)}
                />
            );
        };
    },
});

export const ColorSetter: Setter = {
    type: 'ColorSetter',
    title: '颜色设置器',
    Component: ColorSetterView,
};
