import { defineComponent, onMounted } from 'vue';
import { IPublicTypeSetter } from '@webank/letgo-types';
import { FSwitch } from '@fesjs/fes-design';
import { isUndefined } from 'lodash-es';
import { commonProps } from '../../common';

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
                    modelValue={
                        isUndefined(props.value)
                            ? props.defaultValue
                            : props.value
                    }
                    onChange={(val: any) => props.onChange(val)}
                />
            );
        };
    },
});

export const BoolSetter: IPublicTypeSetter = {
    type: 'BoolSetter',
    title: '布尔类型设置器',
    Component: BoolSetterView,
};
