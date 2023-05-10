import type { CSSProperties, PropType, Ref } from 'vue';
import { defineComponent, inject, ref } from 'vue';
import { useModel } from '@webank/letgo-utils';
import { FCollapseItem, FInputNumber, FRadioGroup, FRadioButton } from '@fesjs/fes-design';
import Row from '../../../component/row';
import InputColor from '../../../component/input-color';
import { addUnit, clearUnit, getPlaceholderPropertyValue } from '../utils';
import { styleKey } from '../const';

enum EnumBackground {
    Image = 1,
    Color = 2,
}

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

        const styleProvide = inject(styleKey);

        const backgroundRef: Ref<EnumBackground> = ref()

        const onStyleChange = (changedStyle: CSSProperties) => {
            props.onStyleChange?.(changedStyle);
        };

        return () => {
            return (
                <FCollapseItem name="background" title="背景">
                    <Row label="背景">
                        <FRadioGroup v-model={backgroundRef.value}>
                            <FRadioButton value={EnumBackground.Color}>颜色</FRadioButton>
                            <FRadioButton value={EnumBackground.Image}>图片</FRadioButton>
                        </FRadioGroup>
                    </Row>
                    {backgroundRef.value === EnumBackground.Color && (
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
                    )}
                </FCollapseItem>
            );
        };
    },
});
