import { defineComponent, onMounted } from 'vue';
import { Setter } from '@webank/letgo-types';
import { FSwitch } from '@fesjs/fes-design';

interface BoolSetterProps {
    value?: number;
    onMounted?: () => void;
    onChange: (val: string) => void;
}

const BoolSetterView = defineComponent<BoolSetterProps>((props) => {
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
});

export const BoolSetter: Setter = {
    type: 'BoolSetter',
    title: '布尔类型设置器',
    Component: BoolSetterView,
    tester: (scheme) => {
        return scheme.propType === 'bool';
    },
};
