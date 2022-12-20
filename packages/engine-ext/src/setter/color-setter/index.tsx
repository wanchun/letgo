import { defineComponent, onMounted } from 'vue';
import { Setter } from '@webank/letgo-types';
import { isUndefined } from 'lodash-es';
import { commonProps } from '../../common/setter-props';
import InputColor from '../../component/input-color';

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
                <InputColor
                    modelValue={
                        isUndefined(props.value)
                            ? props.defaultValue
                            : props.value
                    }
                    onChange={(event: any) => {
                        props.onChange(event.target.value);
                    }}
                ></InputColor>
            );
        };
    },
});

export const ColorSetter: Setter = {
    type: 'ColorSetter',
    title: '颜色设置器',
    Component: ColorSetterView,
};
