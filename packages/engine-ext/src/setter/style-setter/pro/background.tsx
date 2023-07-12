import type { CSSProperties, PropType, Ref } from 'vue';
import { defineComponent, inject, onMounted, ref, watch } from 'vue';
import { useModel } from '@harrywan/letgo-common';
import { AlignmentBottomCenter, AlignmentBottomLeft, AlignmentBottomRight, AlignmentTopCenter, AlignmentTopLeft, AlignmentTopRight, AlignmentVerticalCenter, AlignmentVerticalLeft, AlignmentVerticalRight, Close, DistributeHorizontally, DistributeVertically, GridNine } from '@icon-park/vue-next';
import { FCollapseItem, FGrid, FGridItem, FInput, FInputNumber, FRadioButton, FRadioGroup, FTooltip } from '@fesjs/fes-design';
import { InputColor, InputUnit, Row } from '../../../component';
import { addUnit, clearUnit, getPlaceholderPropertyValue } from '../../../common';
import { styleKey } from '../const';
import { backgroundPositionWrapperCls, customPositionWrapperCls, iconWrapperCls } from './background.css';

enum EnumBackground {
    Image = 1,
    Color = 2,
}

function getURL(str?: string) {
    if (!str)
        return str;
    const urlPattern = /^url\(["']?(.+?)["']?\)/;
    const match = str.match(urlPattern);

    if (match && match[1])
        return match[1];

    console.warn('未找到背景图片URL');
    return '';
}

// TODO: 背景图片支持多个
export const BackgroundView = defineComponent({
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

        const onStyleChange = (changedStyle: CSSProperties) => {
            props.onStyleChange?.(changedStyle);
        };

        const provideStyle = inject(styleKey);

        const backgroundTypeRef: Ref<EnumBackground> = ref();

        const backgroundSizeRef: Ref<string> = ref('');

        const backgroundSizeWidthRef: Ref<string> = ref();

        const backgroundSizeHeightRef: Ref<string> = ref();

        const defaultBackgroundSizeWidthRef: Ref<string> = ref();

        const defaultBackgroundSizeHeightRef: Ref<string> = ref();

        onMounted(() => {
            const defaultBackgroundSize = getPlaceholderPropertyValue(provideStyle.style, 'backgroundSize') as string;

            if (!defaultBackgroundSize)
                return;

            if (['cover', 'contain'].includes(defaultBackgroundSize)) {
                backgroundSizeRef.value = defaultBackgroundSize;
            }
            else {
                const mulSizes = defaultBackgroundSize.split(',');
                const sizes = mulSizes[0].split(' ');
                defaultBackgroundSizeWidthRef.value = sizes[0];
                defaultBackgroundSizeHeightRef.value = sizes?.[1] ?? sizes[0];
            }
        });

        watch([backgroundSizeRef, backgroundSizeWidthRef, backgroundSizeHeightRef], () => {
            if (backgroundSizeRef.value === '') {
                props.onStyleChange?.({
                    backgroundSize: `${addUnit(backgroundSizeWidthRef.value)} ${addUnit(backgroundSizeHeightRef.value)}`,
                });
            }
            else {
                props.onStyleChange?.({
                    backgroundSize: backgroundSizeRef.value,
                });
            }
        });

        const backgroundPositionLeftRef: Ref<string> = ref();

        const backgroundPositionTopRef: Ref<string> = ref();

        const handleClickPosition = (left: string, top: string) => {
            backgroundPositionLeftRef.value = left;
            backgroundPositionTopRef.value = top;
        };

        return () => {
            const defaultOpacity = getPlaceholderPropertyValue(provideStyle.style, 'opacity') || 1;
            return (
                <FCollapseItem name="background" title="背景">
                    <Row label="背景">
                        <FRadioGroup v-model={backgroundTypeRef.value}>
                            <FRadioButton value={EnumBackground.Color}>颜色</FRadioButton>
                            <FRadioButton value={EnumBackground.Image}>图片</FRadioButton>
                        </FRadioGroup>
                    </Row>
                    {backgroundTypeRef.value === EnumBackground.Color && (
                        <>
                            <Row label="背景色">
                                <InputColor
                                    modelValue={currentValue.value.backgroundColor}
                                    defaultValue={getPlaceholderPropertyValue(provideStyle.style, 'backgroundColor')}
                                    onChange={(val: string) => {
                                        onStyleChange({
                                            backgroundColor: val,
                                        });
                                    }}
                                ></InputColor>
                            </Row>
                            <Row label="透明度">
                                <FInputNumber
                                    style={{ width: '100%' }}
                                    modelValue={clearUnit(currentValue.value.opacity)}
                                    placeholder={`${Number(defaultOpacity) * 100 ?? '请选择透明度'}`}
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
                        </>
                    )}
                    {backgroundTypeRef.value === EnumBackground.Image && (
                        <>
                            <Row label="图片URL">
                                <FInput
                                    modelValue={getURL(currentValue.value.backgroundImage)}
                                    placeholder={`${getPlaceholderPropertyValue(provideStyle.style, 'backgroundImage') ?? '请输入图片URL'}`}
                                    onChange={(val: any) => {
                                        onStyleChange({
                                            backgroundImage: val ? `url("${val}")` : undefined,
                                        });
                                    }}
                                ></FInput>
                            </Row>
                            <Row label="尺寸">
                                <FRadioGroup v-model={backgroundSizeRef.value}>
                                    <FRadioButton value={''}>默认</FRadioButton>
                                    <FRadioButton value={'contain'}>等比填充</FRadioButton>
                                    <FRadioButton value={'cover'}>等比覆盖</FRadioButton>
                                </FRadioGroup>
                                <FGrid v-show={!backgroundSizeRef.value} gutter={[8]} style={{ marginTop: '8px' }}>
                                    <FGridItem span={12}>
                                        <InputUnit
                                            v-model={backgroundSizeWidthRef.value}
                                            placeholder={defaultBackgroundSizeWidthRef.value ?? '宽度'}
                                        />
                                    </FGridItem>
                                    <FGridItem span={12}>
                                        <InputUnit
                                            v-model={backgroundSizeHeightRef.value}
                                            placeholder={defaultBackgroundSizeHeightRef.value ?? '宽度'}
                                        />
                                    </FGridItem>
                                </FGrid>
                            </Row>
                            <Row label="定位">
                                <div class={backgroundPositionWrapperCls}>
                                    <div class={iconWrapperCls}>
                                        <AlignmentTopLeft size={24} onClick={() => handleClickPosition('0px', '0px')} />
                                        <AlignmentTopCenter size={24} onClick={() => handleClickPosition('50%', '0px')} />
                                        <AlignmentTopRight size={24} onClick={() => handleClickPosition('100%', '0px')} />
                                        <AlignmentVerticalLeft size={24} onClick={() => handleClickPosition('0px', '50%')} />
                                        <AlignmentVerticalCenter size={24} onClick={() => handleClickPosition('50%', '50%')} />
                                        <AlignmentVerticalRight size={24} onClick={() => handleClickPosition('100%', '50%')} />
                                        <AlignmentBottomLeft size={24} onClick={() => handleClickPosition('0px', '100%')} />
                                        <AlignmentBottomCenter size={24} onClick={() => handleClickPosition('50%', '100%')} />
                                        <AlignmentBottomRight size={24} onClick={() => handleClickPosition('100%', '100%')} />
                                    </div>
                                    <div class={customPositionWrapperCls}>
                                        <Row label="左" labelWidth={20}>
                                            <InputUnit
                                                v-model={backgroundPositionLeftRef.value}
                                            />
                                        </Row>
                                        <Row label="顶" labelWidth={20} margin={false}>
                                            <InputUnit
                                                v-model={backgroundPositionTopRef.value}
                                            />
                                        </Row>

                                    </div>
                                </div>
                            </Row>
                            <Row label="重复显示">
                                <FRadioGroup v-model={currentValue.value.backgroundRepeat}>
                                    <FRadioButton value={'repeat'}>
                                        <FTooltip content="水平和垂直方向重复" placement="top">
                                            <GridNine />
                                        </FTooltip>
                                    </FRadioButton>
                                    <FRadioButton value={'repeat-x'}>
                                        <FTooltip content="水平方向重复" placement="top">
                                            <DistributeHorizontally />
                                        </FTooltip>
                                    </FRadioButton>
                                    <FRadioButton value={'repeat-y'}>
                                        <FTooltip content="垂直方向重复" placement="top">
                                            <DistributeVertically />
                                        </FTooltip>
                                    </FRadioButton>
                                    <FRadioButton value={'no-repeat'}>
                                        <FTooltip content="不重复" placement="top">
                                            <Close />
                                        </FTooltip>
                                    </FRadioButton>
                                </FRadioGroup>
                            </Row>
                            <Row label="透明度">
                                <FInputNumber
                                    style={{ width: '100%' }}
                                    modelValue={clearUnit(currentValue.value.opacity)}
                                    placeholder={`${Number(getPlaceholderPropertyValue(provideStyle.style, 'opacity')) * 100 ?? '请选择透明度'}`}
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
                        </>
                    )}
                </FCollapseItem>
            );
        };
    },
});
