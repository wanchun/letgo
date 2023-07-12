import type { PropType, Ref } from 'vue';
import { defineComponent, ref, watch } from 'vue';
import { useModel } from '@fesjs/letgo-common';
import { FDropdown, FInput, FInputNumber } from '@fesjs/fes-design';
import { addUnit, clearUnit, clearUnit2 } from '../common';

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
    },
    emits: ['update:modelValue', 'change'],
    setup(props, { emit }) {
        const [currentValue, updateCurrentValue] = useModel(props, emit);

        const unitRef: Ref<string> = ref();

        const getUnit = () => {
            if (!currentValue.value)
                return props.units[0];

            for (let i = 0; i < props.units.length; i++) {
                if (currentValue.value.includes(props.units[i]))
                    return props.units[i];
            }
            return null;
        };

        watch(currentValue, () => {
            unitRef.value = getUnit();
        }, {
            immediate: true,
        });

        const onChangeUnit = (val: string) => {
            unitRef.value = val;
            emit('change', addUnit(clearUnit(currentValue.value), val));
            updateCurrentValue(addUnit(clearUnit(currentValue.value), val));
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
                            emit('change', addUnit(val, unitRef.value));
                            updateCurrentValue(addUnit(val, unitRef.value));
                        }}
                        max={unitRef.value === '%' ? 100 : undefined}
                        min={0}
                        v-slots={{
                            suffix: () => (
                                <FDropdown
                                    options={props.units.map(item => ({ value: item, label: item }))}
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
                        emit('change', addUnit(val, unitRef.value));
                        updateCurrentValue(addUnit(val, unitRef.value));
                    }}
                    v-slots={{
                        suffix: () => (
                            <FDropdown
                                trigger="click"
                                options={props.units.map(item => ({ value: item, label: item }))}
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
