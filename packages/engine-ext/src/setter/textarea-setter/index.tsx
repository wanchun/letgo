import { defineComponent, onMounted } from 'vue';
import type { IPublicTypeSetter } from '@webank/letgo-types';
import { isUndefined } from 'lodash-es';
import { FInput } from '@fesjs/fes-design';
import { commonProps } from '../../common';

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
                    modelValue={
                        isUndefined(props.value)
                            ? props.defaultValue
                            : props.value
                    }
                    placeholder={props.placeholder || ''}
                    onInput={(val: any) => props.onChange(val)}
                    style={{ width: '100%' }}
                />
            );
        };
    },
});

export const TextareaSetter: IPublicTypeSetter = {
    type: 'TextareaSetter',
    title: '多行文本设置器',
    Component: TextareaSetterView,
    condition: (field) => {
        const v = field.getValue() ?? field.getDefaultValue();
        return isUndefined(v) || typeof v === 'string';
    },
};
