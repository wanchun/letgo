import type { CSSProperties, PropType } from 'vue';
import { defineComponent, inject } from 'vue';
import { useModel } from '@webank/letgo-utils';
import { FCollapseItem, FGrid, FGridItem, FInputNumber, FSelect, FSpace } from '@fesjs/fes-design';
import { getPlaceholderPropertyValue } from '../../../common';
import { InputUnit, Row } from '../../../component';
import { styleKey } from '../const';
import { lightCls } from '../index.css';

const positionList = [
    {
        value: 'static',
        label: 'static',
        description: '默认定位',
    },
    {
        value: 'relative',
        label: 'relative',
        description: '相对于自己浮动定位',
    },
    {
        value: 'absolute',
        label: 'absolute',
        description: '相对于父浮动元素定位',
    },
    {
        value: 'fixed',
        label: 'fixed',
        description: '相对于屏幕视口定位',
    },
    {
        value: 'sticky',
        label: 'sticky',
        description: '粘性定位',
    },
];

export const PositionView = defineComponent({
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
            return (
                <FCollapseItem name="position" title="定位">
                    <Row label="布局模式">
                        <FSelect
                            modelValue={currentValue.value.position}
                            placeholder={`${getPlaceholderPropertyValue(provideStyle.style, 'position') ?? '请选择定位模式'}`}
                            clearable
                            onUpdate:modelValue={(val) => {
                                onStyleChange({
                                    position: val,
                                });
                            }}
                            options={positionList}
                            v-slots={{
                                option: ({
                                    value,
                                    description,
                                }: {
                                    value: string
                                    description: string
                                }) => {
                                    return (
                                        <FSpace>
                                            <span>{value}</span>
                                            <span class={lightCls}>
                                                {description}
                                            </span>
                                        </FSpace>
                                    );
                                },
                            }}
                        />
                    </Row>
                    <Row label="偏移距离">
                        <FGrid gutter={[12, 12]} wrap>
                            <FGridItem span={12}>
                                <Row label="上" labelWidth={15} labelAlign="right" margin={false}>
                                    <InputUnit
                                        modelValue={currentValue.value.top}
                                        onChange={(val) => {
                                            onStyleChange({
                                                top: val,
                                            });
                                        }}
                                        placeholder={`${getPlaceholderPropertyValue(provideStyle.style, 'top') ?? '上'}`}
                                    />
                                </Row>
                            </FGridItem>
                            <FGridItem span={12}>
                                <Row label="下" labelWidth={15} labelAlign="right" margin={false}>
                                    <InputUnit
                                        modelValue={currentValue.value.bottom}
                                        onChange={(val) => {
                                            onStyleChange({
                                                bottom: val,
                                            });
                                        }}
                                        placeholder={`${getPlaceholderPropertyValue(provideStyle.style, 'bottom') ?? '下'}`}
                                    />
                                </Row>

                            </FGridItem>
                            <FGridItem span={12}>
                                <Row label="左" labelWidth={15} labelAlign="right" margin={false}>
                                    <InputUnit
                                        modelValue={currentValue.value.left}
                                        onChange={(val) => {
                                            onStyleChange({
                                                left: val,
                                            });
                                        }}
                                        placeholder={`${getPlaceholderPropertyValue(provideStyle.style, 'left') ?? '左'}`}
                                    />
                                </Row>

                            </FGridItem>
                            <FGridItem span={12}>
                                <Row label="右" labelWidth={15} labelAlign="right" margin={false}>
                                    <InputUnit
                                        modelValue={currentValue.value.right}
                                        onChange={(val) => {
                                            onStyleChange({
                                                right: val,
                                            });
                                        }}
                                        placeholder={`${getPlaceholderPropertyValue(provideStyle.style, 'right') ?? '右'}`}
                                    />
                                </Row>

                            </FGridItem>
                        </FGrid>
                    </Row>
                    <Row label="zIndex">
                        <FInputNumber
                            style={{ width: '100%' }}
                            modelValue={currentValue.value.zIndex}
                            placeholder={`${getPlaceholderPropertyValue(provideStyle.style, 'zIndex') ?? 'zIndex'}`}
                            onChange={(val) => {
                                onStyleChange({
                                    zIndex: val,
                                });
                            }}
                            min={0}
                        />
                    </Row>
                </FCollapseItem>
            );
        };
    },
});
