import { defineComponent, onMounted, PropType } from 'vue';
import { Setter } from '@webank/letgo-types';
import { FInput } from '@fesjs/fes-design';

const StringSetterView = defineComponent({
    name: 'StringSetterView',
    props: {
        value: String,
        defaultValue: String,
        placeholder: String,
        onMounted: Function as PropType<() => void>,
        onChange: Function as PropType<(val: string) => void>,
    },
    setup(props) {
        onMounted(() => {
            props.onMounted?.();
        });
        return () => {
            return (
                <FInput
                    modelValue={props.value}
                    placeholder={props.placeholder || ''}
                    onInput={(val: any) => props.onChange(val)}
                    style={{ width: '100%' }}
                />
            );
        };
    },
});

export const StringSetter: Setter = {
    type: 'StringSetter',
    title: '字符串设置器',
    Component: StringSetterView,
    tester: (scheme) => {
        return scheme.propType === 'string';
    },
};
