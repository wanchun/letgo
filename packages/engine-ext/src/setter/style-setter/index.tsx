import type { CSSProperties, PropType, VNodeChild } from 'vue';
import { computed, defineComponent, onMounted, provide, ref, watch } from 'vue';
import type { IPublicTypeSetter } from '@webank/letgo-types';
import { isJSExpression } from '@webank/letgo-types';
import { cloneDeep, isNil } from 'lodash-es';
import { FAlert, FCollapse } from '@fesjs/fes-design';
import { commonProps, getComputeStyle } from '../../common';
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

        const isMobile = computed(() => {
            return props.field.designer.simulator.device === 'mobile';
        });

        watch(() => props.value, () => {
            currentValue.value = computeCurrentValue();
        });

        const onStyleChange = (changedStyle: Record<string, any>, assign = true) => {
            const transformedStyle = changedStyle;
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
                    {isMobile.value && <FAlert class="letgo-setter-style_alert" showIcon type="info" message="已开启响应式布局，输入像素大小会转成为vw单位，例如输入15px会转换成4vw。" />}
                    <CodeView
                        value={currentValue.value}
                        onStyleChange={onStyleChange}
                    />
                    <FCollapse v-model={showItems.value} arrow="left" embedded={false}>
                        {styleModuleList.includes('layout') && (
                            <LayoutView
                                isMobile={isMobile.value}
                                onStyleChange={onStyleChange}
                                value={currentValue.value ?? {}}
                            />
                        )}
                        {styleModuleList.includes('font') && (
                            <FontView
                                isMobile={isMobile.value}
                                onStyleChange={onStyleChange}
                                value={currentValue.value ?? {}}
                            />
                        )}
                        {styleModuleList.includes('background') && (
                            <BackgroundView
                                isMobile={isMobile.value}
                                onStyleChange={onStyleChange}
                                value={currentValue.value ?? {}}
                            />
                        )}
                        {styleModuleList.includes('border') && (
                            <BorderView
                                isMobile={isMobile.value}
                                onStyleChange={onStyleChange}
                                value={currentValue.value ?? {}}
                            />
                        )}
                        {styleModuleList.includes('position') && (
                            <PositionView
                                isMobile={isMobile.value}
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
