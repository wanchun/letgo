import { defineComponent, onMounted, PropType, CSSProperties } from 'vue';
import { Setter } from '@webank/letgo-types';
import { useModel } from '@webank/letgo-utils';
import { NCollapse } from 'naive-ui';
import { commonProps } from '../../common/setter-props';
import { LayoutView } from './pro/layout';
import { FontView } from './pro/font';
import { wrapperCls } from './index.css';

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
    setup(props, { emit }) {
        onMounted(() => {
            props.onMounted?.();
        });

        const [currentValue, updateCurrentValue] = useModel(props, emit, {
            prop: 'value',
            defaultValue: {},
        });

        const onStyleChange = (changedStyle: CSSProperties) => {
            const styleData = { ...currentValue.value, ...changedStyle };
            updateCurrentValue(styleData);
            props.onChange(styleData);
        };

        return () => {
            const { styleModuleList } = props;
            return (
                <div class={wrapperCls}>
                    <NCollapse defaultExpandedNames={['layout', 'font']}>
                        {styleModuleList.some((item) => item === 'layout') && (
                            <LayoutView
                                onStyleChange={onStyleChange}
                                value={currentValue.value}
                            ></LayoutView>
                        )}
                        {styleModuleList.some((item) => item === 'font') && (
                            <FontView
                                onStyleChange={onStyleChange}
                                value={currentValue.value}
                            ></FontView>
                        )}
                    </NCollapse>
                </div>
            );
        };
    },
});

export const StyleSetter: Setter = {
    type: 'StyleSetter',
    title: '样式设置器',
    Component: StyleSetterView,
};
