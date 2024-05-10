import type { CSSProperties, PropType, VNodeChild } from 'vue';
import { defineComponent, onMounted, provide, ref, watch } from 'vue';
import type { IPublicTypeSetter } from '@webank/letgo-types';
import { isJSExpression } from '@webank/letgo-types';
import { cloneDeep, isNil } from 'lodash-es';
import { FCollapse } from '@fesjs/fes-design';
import { commonProps, convertPxToVw, getComputeStyle } from '../../common';
import { BackgroundView, BorderView, CodeView, FontView, LayoutView, PositionView } from './pro';
import { styleKey } from './const';
import './index.less';

type StyleModule = 'background' | 'border' | 'font' | 'layout' | 'position';

const StyleSetterView = defineComponent({
    name: 'StyleSetterView',
    props: {
        ...commonProps,
        value: Object as PropType<CSSProperties>,
        defaultValue: Object as PropType<CSSProperties>,
        styleModuleList: {
            type: Array as PropType<Array<StyleModule>>,
            default() {
                return ['background', 'border', 'font', 'layout', 'position'];
            },
        },
        cssCode: {
            type: Boolean,
            default: true,
        },
    },
    setup(props) {
        onMounted(() => {
            props.onMounted?.();
        });

        provide(styleKey, {
            style: getComputeStyle(props.node),
        });

        function computeCurrentValue() {
            return isJSExpression(props.value) ? {} : (cloneDeep(props.value) ?? {});
        }

        const currentValue = ref(computeCurrentValue());

        watch(() => props.value, () => {
            currentValue.value = computeCurrentValue();
        });

        const onStyleChange = (changedStyle: Record<string, any>, assign = true) => {
            let transformedStyle = changedStyle;
            const sim = props.field.designer.simulator;
            if (sim.device === 'mobile')
                transformedStyle = convertPxToVw(changedStyle, 375);

            if (assign) {
                // 把属性值中的 ’‘，null 转换成 undefined
                for (const p in transformedStyle)
                    transformedStyle[p] = (isNil(transformedStyle[p]) || transformedStyle[p] === '') ? undefined : transformedStyle[p];

                const styleData = { ...currentValue.value, ...transformedStyle };
                props.onChange(styleData);
            }
            else {
                props.onChange(transformedStyle);
            }
        };

        const showItems = ref(['layout', 'font', 'background', 'border', 'position']);

        return () => {
            const { styleModuleList } = props;
            return (
                <div class="letgo-setter-style">
                    <CodeView
                        value={currentValue.value}
                        onStyleChange={onStyleChange}
                    />
                    <FCollapse v-model={showItems.value} arrow="left" embedded={false}>
                        {styleModuleList.includes('layout') && (
                            <LayoutView
                                onStyleChange={onStyleChange}
                                value={currentValue.value ?? {}}
                            />
                        )}
                        {styleModuleList.includes('font') && (
                            <FontView
                                onStyleChange={onStyleChange}
                                value={currentValue.value ?? {}}
                            />
                        )}
                        {styleModuleList.includes('background') && (
                            <BackgroundView
                                onStyleChange={onStyleChange}
                                value={currentValue.value ?? {}}
                            />
                        )}
                        {styleModuleList.includes('border') && (
                            <BorderView
                                onStyleChange={onStyleChange}
                                value={currentValue.value ?? {}}
                            />
                        )}
                        {styleModuleList.includes('position') && (
                            <PositionView
                                onStyleChange={onStyleChange}
                                value={currentValue.value ?? {}}
                            />
                        )}
                    </FCollapse>
                </div>
            );
        };
    },
});

export const StyleSetter: IPublicTypeSetter & { renderBackgroundImage?: (props: { value: string; onStyleChange: (style: CSSProperties) => void }) => VNodeChild } = {
    type: 'StyleSetter',
    title: '样式设置器',
    Component: StyleSetterView,
};
