import type { PropType } from 'vue';
import { computed, defineComponent, onMounted } from 'vue';
import type { IPublicTypeSetter } from '@webank/letgo-types';
import { isArray, isUndefined } from 'lodash-es';
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
        value: [Array, Date] as PropType<Date | Date[]>,
        defaultValue: [Array, Date] as PropType<Date | Date[]>,
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
        const currentValue = computed(() => {
            const value = isUndefined(props.value)
                ? props.defaultValue
                : props.value;
            if (isArray(value))
                return value.map(val => val.getTime());

            return value.getTime();
        });

        const onChange = (value: number | number[]) => {
            props.onChange(isArray(value) ? value.map(val => new Date(val)) : new Date(value));
        };

        return () => {
            return (
                <FDatePicker
                    modelValue={currentValue.value}
                    type={props.type}
                    maxDate={props.maxDate}
                    minDate={props.minDate}
                    maxRange={props.maxRange}
                    defaultTime={props.defaultTime}
                    disabledDate={props.disabledDate}
                    onChange={onChange}
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
