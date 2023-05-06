import type { CSSProperties, PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import { NCollapseItem } from 'naive-ui';
import { FGrid, FGridItem, FInput, FSelect, FSpace } from '@fesjs/fes-design';
import { useModel } from '@webank/letgo-utils';
import Row from '../../../component/row';
import { lightCls } from '../index.css';
import { addUnit, clearUnit } from '../utils';

const display = [
    {
        value: 'block',
        label: 'block',
        description: '块级布局',
    },
    {
        value: 'flex',
        label: 'flex',
        description: '弹性布局',
    },
    {
        value: 'inline',
        label: 'inline',
        description: '内联布局',
    },
    {
        value: 'inline-block',
        label: 'inline-block',
        description: '内联块布局',
    },
    {
        value: 'inline-flex',
        label: 'inline-flex',
        description: '内联弹性布局',
    },
    {
        value: 'none',
        label: 'none',
        description: '隐藏',
    },
];

// row | row-reverse | column | column-reverse
const flexDirection = [
    {
        value: 'row',
        label: 'row',
        description: '水平方向，起点在左侧',
    },
    {
        value: 'row-reverse',
        label: 'row-reverse',
        description: '水平方向，起点在右侧',
    },
    {
        value: 'column',
        label: 'column',
        description: '垂直方向，起点在上侧',
    },
    {
        value: 'column-reverse',
        label: 'column-reverse',
        description: '垂直方向，起点在下侧',
    },
];

const justifyContent = [
    {
        value: 'flex-start',
        label: 'flex-start',
        description: '左对齐',
    },
    {
        value: 'flex-end',
        label: 'flex-end',
        description: '右对齐',
    },
    {
        value: 'center',
        label: 'center',
        description: '居中对齐',
    },
    {
        value: 'space-between',
        label: 'space-between',
        description: '两端对齐',
    },
    {
        value: 'space-around',
        label: 'space-around',
        description: '平分空间',
    },
];

const alignItems = [
    {
        value: 'flex-start',
        label: 'flex-start',
        description: '起点对齐',
    },
    {
        value: 'flex-end',
        label: 'flex-end',
        description: '终点对齐',
    },
    {
        value: 'center',
        label: 'center',
        description: '居中对齐',
    },
    {
        value: 'stretch',
        label: 'stretch',
        description: '铺满辅轴',
    },
];

const flexWrap = [
    {
        value: 'nowrap',
        label: 'nowrap',
        description: '不换行',
    },
    {
        value: 'wrap',
        label: 'wrap',
        description: '第一行在上方',
    },
    {
        value: 'wrap-reverse',
        label: 'wrap-reverse',
        description: '第一行在下方',
    },
];

export const LayoutView = defineComponent({
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

        const isFlex = computed(() => {
            return (
                currentValue.value.display === 'inline-flex'
                || currentValue.value.display === 'flex'
            );
        });

        return () => {
            return (
                <NCollapseItem name="layout" title="布局">
                    <Row label="布局模式">
                        <FSelect
                            modelValue={currentValue.value.display}
                            onUpdate:modelValue={(val) => {
                                onStyleChange({
                                    display: val,
                                });
                            }}
                            options={display}
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
                        ></FSelect>
                    </Row>
                    {isFlex.value && (
                        <>
                            <Row label="主轴方向">
                                <FSelect
                                    modelValue={
                                        currentValue.value.flexDirection
                                    }
                                    onUpdate:modelValue={(val) => {
                                        onStyleChange({
                                            flexDirection: val,
                                        });
                                    }}
                                    options={flexDirection}
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
                                ></FSelect>
                            </Row>
                            <Row label="主轴对齐">
                                <FSelect
                                    modelValue={
                                        currentValue.value.justifyContent
                                    }
                                    onUpdate:modelValue={(val) => {
                                        onStyleChange({
                                            justifyContent: val,
                                        });
                                    }}
                                    options={justifyContent}
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
                                ></FSelect>
                            </Row>
                            <Row label="辅轴对齐">
                                <FSelect
                                    modelValue={currentValue.value.alignItems}
                                    onUpdate:modelValue={(val) => {
                                        onStyleChange({
                                            alignItems: val,
                                        });
                                    }}
                                    options={alignItems}
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
                                ></FSelect>
                            </Row>
                            <Row label="换行">
                                <FSelect
                                    modelValue={currentValue.value.flexWrap}
                                    onUpdate:modelValue={(val) => {
                                        onStyleChange({
                                            flexWrap: val,
                                        });
                                    }}
                                    options={flexWrap}
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
                                ></FSelect>
                            </Row>
                        </>
                    )}
                    <Row label="外间距">
                        <FGrid gutter={[8]}>
                            <FGridItem span={6}>
                                <FInput
                                    modelValue={clearUnit(
                                        currentValue.value.marginTop,
                                    )}
                                    onChange={(val) => {
                                        onStyleChange({
                                            marginTop: addUnit(val),
                                        });
                                    }}
                                    v-slots={{
                                        suffix: () => 'px',
                                    }}
                                    placeholder="上"
                                ></FInput>
                            </FGridItem>
                            <FGridItem span={6}>
                                <FInput
                                    modelValue={clearUnit(
                                        currentValue.value.marginBottom,
                                    )}
                                    onChange={(val) => {
                                        onStyleChange({
                                            marginBottom: addUnit(val),
                                        });
                                    }}
                                    v-slots={{
                                        suffix: () => 'px',
                                    }}
                                    placeholder="下"
                                ></FInput>
                            </FGridItem>
                            <FGridItem span={6}>
                                <FInput
                                    modelValue={clearUnit(
                                        currentValue.value.marginLeft,
                                    )}
                                    onChange={(val) => {
                                        onStyleChange({
                                            marginLeft: addUnit(val),
                                        });
                                    }}
                                    v-slots={{
                                        suffix: () => 'px',
                                    }}
                                    placeholder="左"
                                ></FInput>
                            </FGridItem>
                            <FGridItem span={6}>
                                <FInput
                                    modelValue={clearUnit(
                                        currentValue.value.marginRight,
                                    )}
                                    onChange={(val) => {
                                        onStyleChange({
                                            marginRight: addUnit(val),
                                        });
                                    }}
                                    v-slots={{
                                        suffix: () => 'px',
                                    }}
                                    placeholder="右"
                                ></FInput>
                            </FGridItem>
                        </FGrid>
                    </Row>
                    <Row label="内间距">
                        <FGrid gutter={[8]}>
                            <FGridItem span={6}>
                                <FInput
                                    modelValue={clearUnit(
                                        currentValue.value.paddingTop,
                                    )}
                                    onChange={(val) => {
                                        onStyleChange({
                                            paddingTop: addUnit(val),
                                        });
                                    }}
                                    v-slots={{
                                        suffix: () => 'px',
                                    }}
                                    placeholder="上"
                                ></FInput>
                            </FGridItem>
                            <FGridItem span={6}>
                                <FInput
                                    modelValue={clearUnit(
                                        currentValue.value.paddingBottom,
                                    )}
                                    onChange={(val) => {
                                        onStyleChange({
                                            paddingBottom: addUnit(val),
                                        });
                                    }}
                                    v-slots={{
                                        suffix: () => 'px',
                                    }}
                                    placeholder="下"
                                ></FInput>
                            </FGridItem>
                            <FGridItem span={6}>
                                <FInput
                                    modelValue={clearUnit(
                                        currentValue.value.paddingLeft,
                                    )}
                                    onChange={(val) => {
                                        onStyleChange({
                                            paddingLeft: addUnit(val),
                                        });
                                    }}
                                    v-slots={{
                                        suffix: () => 'px',
                                    }}
                                    placeholder="左"
                                ></FInput>
                            </FGridItem>
                            <FGridItem span={6}>
                                <FInput
                                    modelValue={clearUnit(
                                        currentValue.value.paddingRight,
                                    )}
                                    onChange={(val) => {
                                        onStyleChange({
                                            paddingRight: addUnit(val),
                                        });
                                    }}
                                    v-slots={{
                                        suffix: () => 'px',
                                    }}
                                    placeholder="右"
                                ></FInput>
                            </FGridItem>
                        </FGrid>
                    </Row>
                    <Row label="宽高">
                        <FGrid gutter={[8]}>
                            <FGridItem span={12}>
                                <FInput
                                    modelValue={clearUnit(
                                        currentValue.value.width,
                                    )}
                                    onChange={(val) => {
                                        onStyleChange({
                                            width: addUnit(val),
                                        });
                                    }}
                                    v-slots={{
                                        suffix: () => 'px',
                                    }}
                                    placeholder="宽度"
                                ></FInput>
                            </FGridItem>
                            <FGridItem span={12}>
                                <FInput
                                    modelValue={clearUnit(
                                        currentValue.value.height,
                                    )}
                                    onChange={(val) => {
                                        onStyleChange({
                                            height: addUnit(val),
                                        });
                                    }}
                                    v-slots={{
                                        suffix: () => 'px',
                                    }}
                                    placeholder="高度"
                                ></FInput>
                            </FGridItem>
                        </FGrid>
                    </Row>
                </NCollapseItem>
            );
        };
    },
});
