import type { WritableComputedRef } from 'vue';
import { computed, ref, watch } from 'vue';
import { isArray, isEqual as isEqualFunc, isUndefined } from 'lodash-es';

interface UseNormalModelOptions {
    prop?: string
    isEqual?: boolean
    deep?: boolean
    defaultValue?: any
}

export function useModel(props: Record<string, any>,
    emit: any,
    config: UseNormalModelOptions = {}): [WritableComputedRef<any>, (val: any) => void] {
    const {
        prop = 'modelValue',
        deep = false,
        isEqual = false,
        defaultValue,
    } = config;
    const usingProp = prop;
    const currentValue = ref(
        !isUndefined(props[usingProp]) ? props[usingProp] : defaultValue,
    );
    const pureUpdateCurrentValue = (value: any) => {
        if (
            value === currentValue.value
            || (isEqual && isEqualFunc(value, currentValue.value))
        )
            return;

        currentValue.value = value;
    };
    const updateCurrentValue = (value: any) => {
        pureUpdateCurrentValue(value);
        emit(`update:${usingProp}`, currentValue.value);
    };

    watch(
        () => props[usingProp],
        (val) => {
            if (val === currentValue.value)
                return;

            currentValue.value = val;
        },
        {
            deep,
        },
    );

    return [
        computed({
            get() {
                return currentValue.value;
            },
            set(value) {
                updateCurrentValue(value);
            },
        }),
        updateCurrentValue,
    ];
}

export function useArrayModel(props: Record<string, any>,
    emit: any,
    config: UseNormalModelOptions = {}): [WritableComputedRef<any>, (val: any) => void] {
    const [computedValue, updateCurrentValue] = useModel(props, emit, {
        ...config,
        defaultValue: [],
    });

    const updateItem = (value: any) => {
        if (isArray(value)) {
            updateCurrentValue(value);
            return;
        }
        const val = computedValue.value;
        const index = val.indexOf(value);
        if (index !== -1)
            val.splice(index, 1);
        else
            val.push(value);

        updateCurrentValue(val);
    };

    return [computedValue, updateItem];
}
