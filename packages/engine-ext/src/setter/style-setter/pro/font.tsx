import type { CSSProperties, PropType } from 'vue';
import { defineComponent } from 'vue';
import { useModel } from '@webank/letgo-utils';
import { NCollapseItem } from 'naive-ui';
import { FInput, FSelect } from '@fesjs/fes-design';
import Row from '../../../component/row';
import InputColor from '../../../component/input-color';
import { addUnit, clearUnit } from '../utils';

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

        const onStyleChange = (changedStyle: CSSProperties) => {
            props.onStyleChange?.(changedStyle);
        };

        return () => {
            return (
                <NCollapseItem name="font" title="文字">
                    <Row label="字体大小">
                        <FInput
                            modelValue={clearUnit(currentValue.value.fontSize)}
                            onChange={(val) => {
                                onStyleChange({
                                    fontSize: addUnit(val),
                                });
                            }}
                            v-slots={{
                                suffix: () => 'px',
                            }}
                            placeholder="字体大小"
                        ></FInput>
                    </Row>
                    <Row label="字体行高">
                        <FInput
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
                            placeholder="行高"
                        ></FInput>
                    </Row>
                    <Row label="字体粗细">
                        <FSelect
                            modelValue={currentValue.value.fontWeight}
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
                            onChange={(val) => {
                                onStyleChange({
                                    textAlign: val,
                                });
                            }}
                            options={textAlign}
                        ></FSelect>
                    </Row>
                    <Row label="透明度">
                        <FInput
                            modelValue={clearUnit(currentValue.value.opacity)}
                            onChange={(val) => {
                                onStyleChange({
                                    opacity: addUnit(val, '%'),
                                });
                            }}
                            v-slots={{
                                suffix: () => '%',
                            }}
                            placeholder="透明度"
                        ></FInput>
                    </Row>
                </NCollapseItem>
            );
        };
    },
});
