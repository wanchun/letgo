import type { CSSProperties, PropType } from 'vue';
import { defineComponent, inject } from 'vue';
import { useModel } from '@webank/letgo-utils';
import { FCollapseItem, FInputNumber, FSelect } from '@fesjs/fes-design';
import Row from '../../../component/row';
import InputColor from '../../../component/input-color';
import { addUnit, clearUnit, getPlaceholderPropertyValue } from '../utils';
import { styleKey } from '../const';

const fontWeight = [
    {
        value: 100,
        label: '100 Thin',
    },
    {
        value: 200,
        label: '200 Extra Light',
    },
    {
        value: 300,
        label: '300 Light',
    },
    {
        value: 400,
        label: '400 Normal',
    },
    {
        value: 500,
        label: '500 Medium',
    },
    {
        value: 600,
        label: '600 Semi Bold',
    },
    {
        value: 700,
        label: '700 Bold',
    },
    {
        value: 800,
        label: '800 Extra Bold',
    },
];

const textAlign = [
    {
        value: 'left',
        label: 'left 左对齐',
    },
    {
        value: 'center',
        label: 'center 居中',
    },
    {
        value: 'right',
        label: 'right 右对齐',
    },
    {
        value: 'justify',
        label: 'justify 两端对齐',
    },
];

export const BorderView = defineComponent({
    props: {
        value: {
            type: Object as PropType<CSSProperties>,
        },
        onStyleChange: Function as PropType<(style: CSSProperties) => void>,
    },
    setup(props, { emit }) {
        const [currentValue] = useModel(props, emit, {
            prop: 'value',
            defaultValue: {},
        });

        const styleProvide = inject(styleKey);

        const onStyleChange = (changedStyle: CSSProperties) => {
            props.onStyleChange?.(changedStyle);
        };

        return () => {
            return (
                <FCollapseItem name="border" title="边框">
                    <Row label="字体大小">
                        <FInputNumber
                            modelValue={clearUnit(currentValue.value.fontSize)}
                            onChange={(val) => {
                                onStyleChange({
                                    fontSize: addUnit(val),
                                });
                            }}
                            v-slots={{
                                suffix: () => 'px',
                            }}
                            placeholder={`${getPlaceholderPropertyValue(styleProvide.style, 'fontSize') ?? '字体大小'}` }
                        ></FInputNumber>
                    </Row>
                    <Row label="字体行高">
                        <FInputNumber
                            modelValue={clearUnit(
                                currentValue.value.lineHeight,
                            )}
                            onChange={(val) => {
                                onStyleChange({
                                    lineHeight: addUnit(val),
                                });
                            }}
                            v-slots={{
                                suffix: () => 'px',
                            }}
                            placeholder={`${getPlaceholderPropertyValue(styleProvide.style, 'lineHeight') ?? '输入行高'}` }
                        ></FInputNumber>
                    </Row>
                    <Row label="字体粗细">
                        <FSelect
                            modelValue={currentValue.value.fontWeight}
                            placeholder={`${getPlaceholderPropertyValue(styleProvide.style, 'fontWeight') ?? '请选择字体粗细'}` }
                            clearable
                            onChange={(val) => {
                                onStyleChange({
                                    fontWeight: val,
                                });
                            }}
                            options={fontWeight}
                        ></FSelect>
                    </Row>
                    <Row label="字体颜色">
                        <InputColor
                            modelValue={currentValue.value.color}
                            placeholder={`${getPlaceholderPropertyValue(styleProvide.style, 'color') ?? '请选择字体颜色'}` }
                            onChange={(event: any) => {
                                onStyleChange({
                                    color: event.target.value,
                                });
                            }}
                        ></InputColor>
                    </Row>
                    <Row label="对齐">
                        <FSelect
                            modelValue={currentValue.value.textAlign}
                            placeholder={`${getPlaceholderPropertyValue(styleProvide.style, 'textAlign') ?? '请选择文字对齐'}` }
                            clearable
                            onChange={(val) => {
                                onStyleChange({
                                    textAlign: val,
                                });
                            }}
                            options={textAlign}
                        ></FSelect>
                    </Row>
                    <Row label="透明度">
                        <FInputNumber
                            style={{ width: '100%' }}
                            modelValue={clearUnit(currentValue.value.opacity)}
                            placeholder={`${Number(getPlaceholderPropertyValue(styleProvide.style, 'opacity')) * 100 ?? '请选择透明度'}` }
                            onChange={(val) => {
                                onStyleChange({
                                    opacity: addUnit(val, '%'),
                                });
                            }}
                            max={100}
                            min={0}
                            v-slots={{
                                suffix: () => '%',
                            }}
                        ></FInputNumber>
                    </Row>
                </FCollapseItem>
            );
        };
    },
});
