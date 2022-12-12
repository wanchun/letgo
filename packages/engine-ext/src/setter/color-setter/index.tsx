import { defineComponent, onMounted } from 'vue';
import { Setter } from '@webank/letgo-types';
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
                <input
                    type="color"
                    value={props.value}
                    onInput={(event: any) => {
                        props.onChange(event.target.value);
                    }}
                ></input>
            );
        };
    },
});

export const ColorSetter: Setter = {
    type: 'ColorSetter',
    title: '颜色设置器',
    Component: ColorSetterView,
};
