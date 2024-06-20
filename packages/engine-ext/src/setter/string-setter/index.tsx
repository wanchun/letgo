import { FInput } from '@fesjs/fes-design';
import type { IPublicTypeSetter } from '@webank/letgo-types';
import { isUndefined } from 'lodash-es';
import { defineComponent, onMounted } from 'vue';
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
        const onChange = (val: string) => {
            const filedKey = props.field.name;
            // 循环标识key为空时，要置为undefined
            if (filedKey === 'key' && val === '') {
                props.onChange(undefined);
                return;
            }
            props.onChange(val);
        };
        return () => {
            return (
                <FInput
                    modelValue={
                        isUndefined(props.value)
                            ? props.defaultValue
                            : props.value
                    }
                    placeholder={props.placeholder || ''}
                    onInput={onChange}
                    style={{ width: '100%' }}
                />
            );
        };
    },
});

export const StringSetter: IPublicTypeSetter = {
    type: 'StringSetter',
    title: '字符设置器',
    Component: StringSetterView,
    condition: (field) => {
        const v = field.getValue() ?? (field).getDefaultValue();
        return typeof v === 'string';
    },
};
