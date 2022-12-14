import { defineComponent, onMounted } from 'vue';
import { Setter } from '@webank/letgo-types';
import { FInput } from '@fesjs/fes-design';
import { commonProps } from '../../common/setter-props';

const TextareaSetterView = defineComponent({
    name: 'TextareaSetterView',
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
                <FInput
                    type="textarea"
                    modelValue={props.value}
                    placeholder={props.placeholder || ''}
                    onInput={(val: any) => props.onChange(val)}
                    style={{ width: '100%' }}
                />
            );
        };
    },
});

export const TextareaSetter: Setter = {
    type: 'TextareaSetter',
    title: '多行文本设置器',
    Component: TextareaSetterView,
    condition: (field) => {
        const v = field.getValue();
        return typeof v === 'string';
    },
};
