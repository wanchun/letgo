import type { CSSProperties, PropType, Ref } from 'vue';
import { defineComponent, inject, onMounted, ref, watch } from 'vue';
import { useModel } from '@webank/letgo-utils';
import { AlignmentBottomCenter, AlignmentBottomLeft, AlignmentBottomRight, AlignmentTopCenter, AlignmentTopLeft, AlignmentTopRight, AlignmentVerticalCenter, AlignmentVerticalLeft, AlignmentVerticalRight } from '@icon-park/vue-next';
import { FCollapseItem, FGrid, FGridItem, FInput, FInputNumber, FRadioButton, FRadioGroup } from '@fesjs/fes-design';
import { InputColor, Row } from '../../../component';
import { addUnit, clearUnit, getPlaceholderPropertyValue } from '../utils';
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

        const styleProvide = inject(styleKey);

        const backgroundTypeRef: Ref<EnumBackground> = ref();

        const backgroundSizeRef: Ref<string> = ref('');

        const backgroundSizeWidthRef: Ref<string> = ref();

        const backgroundSizeHeightRef: Ref<string> = ref();

        const defaultBackgroundSizeWidthRef: Ref<string> = ref();

        const defaultBackgroundSizeHeightRef: Ref<string> = ref();

        onMounted(() => {
            const defaultBackgroundSize = getPlaceholderPropertyValue(styleProvide.style, 'backgroundSize') as string;

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

        return () => {
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
                                    placeholder={`${getPlaceholderPropertyValue(styleProvide.style, 'backgroundColor') ?? '请选择背景颜色'}`}
                                    onChange={(event: any) => {
                                        onStyleChange({
                                            backgroundColor: event.target.value,
                                        });
                                    }}
                                ></InputColor>
                            </Row>
                            <Row label="透明度">
                                <FInputNumber
                                    style={{ width: '100%' }}
                                    modelValue={clearUnit(currentValue.value.opacity)}
                                    placeholder={`${Number(getPlaceholderPropertyValue(styleProvide.style, 'opacity')) * 100 ?? '请选择透明度'}`}
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
                                    placeholder={`${getPlaceholderPropertyValue(styleProvide.style, 'backgroundImage') ?? '请输入图片URL'}`}
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
                                        <FInput
                                            v-model={backgroundSizeWidthRef.value}
                                            v-slots={{
                                                suffix: () => 'px',
                                            }}
                                            placeholder={defaultBackgroundSizeWidthRef.value ?? '宽度'}
                                        ></FInput>
                                    </FGridItem>
                                    <FGridItem span={12}>
                                        <FInput
                                            v-model={backgroundSizeHeightRef.value}
                                            v-slots={{
                                                suffix: () => 'px',
                                            }}
                                            placeholder={defaultBackgroundSizeHeightRef.value ?? '高度'}
                                        ></FInput>
                                    </FGridItem>
                                </FGrid>
                            </Row>
                            <Row label="定位">
                                <div class={backgroundPositionWrapperCls}>
                                    <div class={iconWrapperCls}>
                                        <AlignmentTopLeft size={24} />
                                        <AlignmentTopCenter size={24} />
                                        <AlignmentTopRight size={24} />
                                        <AlignmentVerticalLeft size={24} />
                                        <AlignmentVerticalCenter size={24} />
                                        <AlignmentVerticalRight size={24} />
                                        <AlignmentBottomLeft size={24} />
                                        <AlignmentBottomCenter size={24} />
                                        <AlignmentBottomRight size={24} />
                                    </div>
                                    <div class={customPositionWrapperCls}>
                                        <Row label="左" labelWidth={20}>
                                            <FInput
                                                v-model={backgroundPositionLeftRef.value}
                                                v-slots={{
                                                    suffix: () => 'px',
                                                }}
                                            ></FInput>
                                        </Row>
                                        <Row label="顶" labelWidth={20}>
                                            <FInput
                                                v-model={backgroundPositionTopRef.value}
                                                v-slots={{
                                                    suffix: () => 'px',
                                                }}
                                            ></FInput>
                                        </Row>

                                    </div>
                                </div>
                            </Row>
                        </>
                    )}
                </FCollapseItem>
            );
        };
    },
});
