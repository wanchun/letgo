import type { PropType, Ref } from 'vue';
import { computed, defineComponent, ref, watch } from 'vue';
import { useModel } from '@webank/letgo-common';
import { FDropdown, FInput, FInputNumber } from '@fesjs/fes-design';
import { addUnit, clearUnit, clearUnit2, convertPxToVw } from '../common';

export const InputUnit = defineComponent({
    props: {
        placeholder: {
            type: String,
            default: '请输入',
        },
        modelValue: String,
        units: {
            type: Array as PropType<string[]>,
            default() {
                return ['px', '%'];
            },
        },
        type: {
            type: String,
            default: 'input',
        },
        isMobile: Boolean,
    },
    emits: ['update:modelValue', 'change'],
    setup(props, { emit }) {
        const [currentValue, updateCurrentValue] = useModel(props, emit);

        const unitRef: Ref<string> = ref();

        const currentUnits = computed(() => {
            if (!props.isMobile)
                return props.units;
            return [...props.units, 'vw'];
        });

        const getUnit = () => {
            if (!currentValue.value)
                return currentUnits.value[0];

            for (let i = 0; i < currentUnits.value.length; i++) {
                if (currentValue.value.includes(currentUnits.value[i]))
                    return currentUnits.value[i];
            }
            return null;
        };

        watch(currentValue, () => {
            unitRef.value = getUnit();
        }, {
            immediate: true,
        });

        const onChangeUnit = (unit: string) => {
            let val = clearUnit(currentValue.value);
            if (props.isMobile) {
                if (unitRef.value === 'px' && unit === 'vw')
                    val = val / 375 * 100;

                if (unitRef.value === 'vw' && unit === 'px')
                    val = val * 375 / 100;
            }
            unitRef.value = unit;
            emit('change', addUnit(val, unit));
            updateCurrentValue(addUnit(val, unit));
        };

        return () => {
            if (!unitRef.value) {
                return (
                    <FInput
                        style={{ width: '100%' }}
                        modelValue={currentValue.value}
                        onChange={(val) => {
                            emit('change', val);
                            updateCurrentValue(val);
                        }}
                        placeholder={props.placeholder}
                    />
                );
            }
            if (props.type === 'number') {
                return (
                    <FInputNumber
                        style={{ width: '100%' }}
                        modelValue={clearUnit(currentValue.value)}
                        placeholder={`${clearUnit2(props.placeholder)}`}
                        onChange={(val) => {
                            let innerVal = addUnit(val, unitRef.value);
                            if (props.isMobile)
                                innerVal = convertPxToVw(innerVal);

                            emit('change', innerVal);
                            updateCurrentValue(innerVal);
                        }}
                        max={unitRef.value === '%' ? 100 : undefined}
                        min={0}
                        v-slots={{
                            suffix: () => (
                                <FDropdown
                                    options={currentUnits.value.map(item => ({ value: item, label: item }))}
                                    onClick={((val) => { unitRef.value = val; })}
                                >
                                    <span>{unitRef.value}</span>
                                </FDropdown>
                            ),
                        }}
                    />
                );
            }

            return (
                <FInput
                    style={{ width: '100%' }}
                    modelValue={clearUnit(currentValue.value)}
                    placeholder={`${clearUnit2(props.placeholder)}`}
                    onChange={(val) => {
                        let innerVal = addUnit(val, unitRef.value);
                        if (props.isMobile)
                            innerVal = convertPxToVw(innerVal);

                        emit('change', innerVal);
                        updateCurrentValue(innerVal);
                    }}
                    v-slots={{
                        suffix: () => (
                            <FDropdown
                                trigger="click"
                                options={currentUnits.value.map(item => ({ value: item, label: item }))}
                                onClick={onChangeUnit}
                            >
                                <span style={{ cursor: 'pointer' }}>{unitRef.value}</span>
                            </FDropdown>
                        ),
                    }}
                />
            );
        };
    },
});
