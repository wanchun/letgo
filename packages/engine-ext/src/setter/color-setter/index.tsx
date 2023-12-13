import { defineComponent, onMounted } from 'vue';
import type { IPublicTypeSetter } from '@webank/letgo-types';
import { isUndefined } from 'lodash-es';
import { commonProps } from '../../common';
import { InputColor } from '../../component';

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
                    onChange={(val: string) => {
                        props.onChange(val);
                    }}
                ></InputColor>
            );
        };
    },
});

export const ColorSetter: IPublicTypeSetter = {
    type: 'ColorSetter',
    title: '颜色设置器',
    Component: ColorSetterView,
};
