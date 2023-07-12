import { defineComponent, onMounted } from 'vue';
import type { IPublicTypeSetter } from '@harrywan/letgo-types';
import { isUndefined } from 'lodash-es';
import { FTimePicker } from '@fesjs/fes-design';
import { commonProps } from '../../common';

const TimeSetterView = defineComponent({
    name: 'TimeSetterView',
    props: {
        ...commonProps,
        value: String,
        defaultValue: String,
        format: String,
    },
    setup(props) {
        onMounted(() => {
            props.onMounted?.();
        });
        return () => {
            return (
                <FTimePicker
                    modelValue={
                        isUndefined(props.value)
                            ? props.defaultValue
                            : props.value
                    }
                    onChange={(val: any) => props.onChange(val)}
                    format={props.format}
                    style={{ width: '100%' }}
                />
            );
        };
    },
});

export const TimeSetter: IPublicTypeSetter = {
    type: 'TimeSetter',
    title: '时间设置器',
    Component: TimeSetterView,
};
