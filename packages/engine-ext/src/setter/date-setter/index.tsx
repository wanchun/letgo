import type { PropType } from 'vue';
import { computed, defineComponent, onMounted } from 'vue';
import { isJSExpression } from '@webank/letgo-types';
import type { IPublicTypeJSExpression, IPublicTypeSetter } from '@webank/letgo-types';
import { executeExpression } from '@webank/letgo-common';
import { isArray, isNumber, isUndefined } from 'lodash-es';
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

enum EnumValueType {
    Date = 'date',
    Number = 'number',
}

const DateSetterView = defineComponent({
    name: 'DateSetterView',
    props: {
        ...commonProps,
        value: [Array, Object, Number] as PropType<number | number[] | IPublicTypeJSExpression | IPublicTypeJSExpression[]>,
        defaultValue: [Array, Object, Number] as PropType<number | number[] | IPublicTypeJSExpression | IPublicTypeJSExpression[]>,
        type: {
            type: String as PropType<EnumType>,
            default: EnumType.Date,
        },
        valueType: {
            type: String as PropType<EnumValueType>,
            default: EnumValueType.Date,
        },
        maxDate: Date,
        minDate: Date,
        maxRange: String,
        defaultTime: [String, Array] as PropType<string | string[]>,
        disabledDate: Function as PropType<(date: Date | number) => boolean>,
    },
    setup(props) {
        onMounted(() => {
            props.onMounted?.();
        });
        const currentValue = computed(() => {
            const value = isUndefined(props.value)
                ? props.defaultValue
                : props.value;

            if (isArray(value)) {
                return value.map((val) => {
                    if (isJSExpression(val))
                        return (executeExpression(val.value) as any)?.getTime();

                    else if (isNumber(val))
                        return val;

                    return undefined;
                }).filter(val => val !== undefined);
            }

            if (isJSExpression(value))
                return (executeExpression(value.value) as any)?.getTime();

            if (isNumber(value))
                return value;

            return undefined;
        });

        const onChange = (value: number | number[]) => {
            let res;
            if (props.valueType === EnumValueType.Date)
                res = isArray(value) ? value.map(val => new Date(val)) : new Date(value);

            else if (props.valueType === EnumValueType.Number)
                res = value;

            props.onChange(res);
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
