import type { CSSProperties, PropType } from 'vue';
import { defineComponent, inject } from 'vue';
import { useModel } from '@webank/letgo-common';
import { FCollapseItem, FInputNumber, FRadioButton, FRadioGroup, FSelect, FTooltip } from '@fesjs/fes-design';
import { AlignLeft, AlignRight, AlignTextBoth, AlignTextCenter } from '@icon-park/vue-next';
import { InputColor, InputUnit, Row } from '../../../component';
import { addUnit, clearUnit, getPlaceholderPropertyValue } from '../../../common';
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

export const FontView = defineComponent({
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

        const provideStyle = inject(styleKey);

        const onStyleChange = (changedStyle: CSSProperties) => {
            props.onStyleChange?.(changedStyle);
        };

        return () => {
            const defaultOpacity = getPlaceholderPropertyValue(provideStyle.style, 'opacity') || 1;
            return (
                <FCollapseItem name="font" title="文字">
                    <Row label="字体大小">
                        <InputUnit
                            modelValue={currentValue.value.fontSize}
                            onChange={(val) => {
                                onStyleChange({
                                    fontSize: val,
                                });
                            }}
                            placeholder={`${getPlaceholderPropertyValue(provideStyle.style, 'fontSize') ?? '字体大小'}`}
                        />
                    </Row>
                    <Row label="字体行高">
                        <InputUnit
                            modelValue={currentValue.value.lineHeight}
                            onChange={(val) => {
                                onStyleChange({
                                    lineHeight: val,
                                });
                            }}
                            placeholder={`${getPlaceholderPropertyValue(provideStyle.style, 'lineHeight') ?? '行高'}`}
                        />
                    </Row>
                    <Row label="字体粗细">
                        <FSelect
                            modelValue={currentValue.value.fontWeight}
                            placeholder={`${getPlaceholderPropertyValue(provideStyle.style, 'fontWeight') ?? '字体粗细'}`}
                            clearable
                            onChange={(val) => {
                                onStyleChange({
                                    fontWeight: val,
                                });
                            }}
                            options={fontWeight}
                        >
                        </FSelect>
                    </Row>
                    <Row label="字体颜色">
                        <InputColor
                            modelValue={currentValue.value.color}
                            defaultValue={getPlaceholderPropertyValue(provideStyle.style, 'color')}
                            onChange={(val: string) => {
                                onStyleChange({
                                    color: val,
                                });
                            }}
                        >
                        </InputColor>
                    </Row>
                    <Row label="对齐">
                        <FRadioGroup
                            modelValue={currentValue.value.textAlign}
                            onChange={(val: 'left' | 'right' | 'center' | 'justify') => {
                                onStyleChange({
                                    textAlign: val,
                                });
                            }}
                        >
                            <FRadioButton value="left">
                                <FTooltip content="left 左对齐" placement="top">
                                    <AlignLeft />
                                </FTooltip>
                            </FRadioButton>
                            <FRadioButton value="center">
                                <FTooltip content="center 居中" placement="top">
                                    <AlignTextCenter />
                                </FTooltip>
                            </FRadioButton>
                            <FRadioButton value="right">
                                <FTooltip content="right 右对齐" placement="top">
                                    <AlignRight />
                                </FTooltip>
                            </FRadioButton>
                            <FRadioButton value="justify">
                                <FTooltip content="justify 两端对齐" placement="top">
                                    <AlignTextBoth />
                                </FTooltip>
                            </FRadioButton>
                        </FRadioGroup>
                    </Row>
                    <Row label="透明度">
                        <FInputNumber
                            style={{ width: '100%' }}
                            modelValue={clearUnit(currentValue.value.opacity)}
                            placeholder={`${Number(defaultOpacity) * 100 ?? '透明度'}`}
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
                        >
                        </FInputNumber>
                    </Row>
                </FCollapseItem>
            );
        };
    },
});
