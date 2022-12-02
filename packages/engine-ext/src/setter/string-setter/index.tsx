import { defineComponent, onMounted } from 'vue';
import { Setter } from '@webank/letgo-types';
import { FInput } from '@fesjs/fes-design';

interface StringSetterProps {
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    onMounted?: () => void;
    onChange: (val: string) => void;
}

const StringSetterView = defineComponent<StringSetterProps>((props) => {
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
});

export const StringSetter: Setter = {
    type: 'StringSetter',
    title: '字符串设置器',
    Component: StringSetterView,
    tester: (scheme) => {
        return scheme.propType === 'string';
    },
};
