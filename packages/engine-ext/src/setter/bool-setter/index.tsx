import { FSwitch } from '@fesjs/fes-design';
import { createSetterContent } from '@webank/letgo-designer';
import type { IPublicTypeSetter, IPublicTypeSetterConfig } from '@webank/letgo-types';
import { isFunction, isNil, isUndefined } from 'lodash-es';
import type { PropType } from 'vue';
import { defineComponent, onMounted, ref } from 'vue';
import { commonProps } from '../../common';

const BoolSetterView = defineComponent({
    name: 'BoolSetterView',
    props: {
        ...commonProps,
        value: [Boolean, Array, Object],
        defaultValue: [Boolean, Array, Object],
        extraSetter: {
            type: Object as PropType<IPublicTypeSetterConfig>,
        },
    },
    setup(props) {
        const { field, extraSetter } = props;

        const value = isUndefined(props.value) ? props.defaultValue : props.value;

        const isChecked = ref(!isNil(value) && value !== false);

        const onChange = (val: boolean) => {
            props.onChange(val);
        };

        const renderExtra = () => {
            if (!extraSetter)
                return;

            if (!isChecked.value)
                return;

            const value = field.getValue();
            const setterType = extraSetter.componentName;
            let setterProps = {};
            let defaultValue;
            if (extraSetter.props) {
                setterProps = extraSetter.props;
                if (typeof setterProps === 'function')
                    setterProps = setterProps(field);
            }
            if (extraSetter.defaultValue)
                defaultValue = extraSetter.defaultValue;

            return createSetterContent(setterType, {
                ...setterProps,
                field,
                node: field.top.getNode(),
                key: field.id,
                value,
                defaultValue: isFunction(defaultValue)
                    ? defaultValue(field)
                    : defaultValue,
                onChange: (value: any) => {
                    field.setValue(value);
                },
            });
        };

        onMounted(() => {
            props.onMounted?.();
        });

        return () => {
            return (
                <>
                    <FSwitch
                        v-model={isChecked.value}
                        onChange={onChange}
                    />
                    {renderExtra()}
                </>

            );
        };
    },
});

export const BoolSetter: IPublicTypeSetter = {
    type: 'BoolSetter',
    title: '布尔设置器',
    Component: BoolSetterView,
    condition: (field) => {
        const v = field.getValue() ?? field.getDefaultValue();
        return typeof v === 'boolean';
    },
};
