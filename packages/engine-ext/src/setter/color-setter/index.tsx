import { defineComponent, onMounted } from 'vue';
import { Setter } from '@webank/letgo-types';
import { Sketch } from '@ckpack/vue-color';
import { commonProps } from '../../common/setter-props';

const ColorSetterView = defineComponent({
    name: 'ColorSetterView',
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
