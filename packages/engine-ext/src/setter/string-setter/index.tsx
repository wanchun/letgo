import { defineComponent, onMounted } from 'vue';
import type { IPublicTypeSetter } from '@webank/letgo-types';
import { isUndefined } from 'lodash-es';
import { FInput } from '@fesjs/fes-design';
import { commonProps } from '../../common';

const StringSetterView = defineComponent({
    name: 'StringSetterView',
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

export const StringSetter: IPublicTypeSetter = {
    type: 'StringSetter',
    title: '字符串设置器',
    Component: StringSetterView,
    condition: (field) => {
        const v = field.getValue();
        return typeof v === 'string';
    },
};
