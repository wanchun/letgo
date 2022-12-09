import { defineComponent, onMounted, PropType, CSSProperties } from 'vue';
import { Setter } from '@webank/letgo-types';
import { useVModel } from '@vueuse/core';
import { NCollapse } from 'naive-ui';
import { commonProps } from '../../common/setter-props';
import Layout from './pro/layout';
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

        const currentValue = useVModel(props, 'value', emit);

        const onStyleChange = (changedStyle: CSSProperties) => {
            currentValue.value = Object.assign(
                currentValue.value,
                changedStyle,
            );
        };

        return () => {
            const { styleModuleList } = props;
            return (
                <div class={wrapperCls}>
                    <NCollapse defaultExpandedNames={['layout']}>
                        {styleModuleList.some((item) => item === 'layout') && (
                            <Layout
                                onStyleChange={onStyleChange}
                                data={currentValue.value}
                            ></Layout>
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
