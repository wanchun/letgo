import type { PropType } from 'vue';
import { defineComponent, onMounted } from 'vue';
import type { IPublicTypeSetter } from '@webank/letgo-types';
import { isUndefined } from 'lodash-es';
import { FDatePicker } from '@fesjs/fes-design';
import { commonProps } from '../../common';

enum EnumType {
    Date = 'date',
    DateTime = 'datetime',
    DateMultiple = 'datemultiple',
    DateRange = 'daterange',
    DateTimeRage = 'datetimerange',
    DateMonthRange = 'datemonthrange',
    Year = 'year',
    Month = 'month',
    Quarter = 'quarter',
}

const DateSetterView = defineComponent({
    name: 'DateSetterView',
    props: {
        ...commonProps,
        value: [Array, Number] as PropType<number | number[]>,
        defaultValue: [Array, Number] as PropType<number | number[]>,
        type: {
            type: String as PropType<EnumType>,
            default: EnumType.Date,
        },
        maxDate: Date,
        minDate: Date,
        maxRange: String,
        defaultTime: [String, Array] as PropType<string | string[]>,
        disabledDate: Function as PropType<(date: Date) => boolean>,
    },
    setup(props) {
        onMounted(() => {
            props.onMounted?.();
        });
        return () => {
            return (
                <FDatePicker
                    modelValue={
                        isUndefined(props.value)
                            ? props.defaultValue
                            : props.value
                    }
                    type={props.type}
                    maxDate={props.maxDate}
                    minDate={props.minDate}
                    maxRange={props.maxRange}
                    defaultTime={props.defaultTime}
                    disabledDate={props.disabledDate}
                    onChange={(val: any) => props.onChange(val)}
                    style={{ width: '100%' }}
                />
            );
        };
    },
});

export const DateSetter: IPublicTypeSetter = {
    type: 'DateSetter',
    title: '日期设置器',
    Component: DateSetterView,
};
