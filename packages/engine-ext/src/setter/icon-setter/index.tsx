import type { Component, PropType } from 'vue';
import { computed, defineComponent, onMounted, ref } from 'vue';
import { isArray, isUndefined } from 'lodash-es';
import { isJSSlot } from '@webank/letgo-types';
import type { IPublicTypeJSSlot, IPublicTypeSetter } from '@webank/letgo-types';
import { FGrid, FGridItem, FTooltip } from '@fesjs/fes-design';
import { CloseCircleFilled } from '@fesjs/fes-design/icon';
import { commonProps } from '../../common';
import { iconBoxCls, iconCls, iconsCls, inputCls, textCls, textNullCls, wrapCls } from './index.css';
import Icon from './icon';

function getIconList() {
    const iframe = document.querySelector<HTMLIFrameElement>(
        'iframe[name=SimulatorRenderer]',
    )!;

    // 会在页面中添加svg元素
    const symbols = Array.prototype.slice.call(
        iframe.contentDocument!.querySelectorAll(
            'svg[style="position: absolute; width: 0px; height: 0px; overflow: hidden;"][aria-hidden="true"] > symbol',
        ),
    );

    return symbols.map((symbol) => {
        const { id } = symbol;
        const { x, y, width, height } = symbol?.viewBox?.baseVal ?? {};
        return {
            name: id,
            icon: () => (
                <span role="img">
                    <svg
                        viewBox={`${x},${y},${width},${height}`}
                        style={{
                            width: '1em',
                            height: '1em',
                            fill: 'none',
                        }}
                        v-html={symbol.innerHTML}
                    >
                    </svg>
                </span>
            ),
        };
    });
}

const IconSetterView = defineComponent({
    name: 'IconSetterView',
    props: {
        ...commonProps,
        value: [String, Object] as PropType<string | IPublicTypeJSSlot>,
        defaultValue: [String, Object] as PropType<string | IPublicTypeJSSlot>,
        type: {
            type: String,
            default: 'string',
        },
        onChange: {
            type: Function as PropType<(icon: string | IPublicTypeJSSlot) => void>,
        },
        icons: {
            type: Array as PropType<string[]>,
            default: () => [] as string[],
        },
    },
    setup(props) {
        const icons: Record<string, Component> = {};

        getIconList().forEach((item) => {
            icons[item.name] = item?.icon;
        });

        onMounted(() => {
            props.onMounted?.();
        });

        const isHoverRef = ref(false);

        const iconName = computed(() => {
            const val = isUndefined(props.value)
                ? props.defaultValue
                : props.value;

            if (isJSSlot(val)) {
                let firstNodeData: any;
                if (isArray(val.value) && val.value.length)
                    firstNodeData = val.value[0];
                else
                    firstNodeData = val.value;

                return firstNodeData?.props?.type;
            }

            return val;
        });

        const handleChange = (icon: string) => {
            if (props.type === 'string') {
                props.onChange(icon);
            }
            else if (props.type === 'node') {
                props.onChange({
                    type: 'JSSlot',
                    value: {
                        componentName: 'Icon',
                        props: {
                            type: icon,
                        },
                    },
                });
            }
        };

        const renderIcons = () => {
            return (
                <FGrid class={iconsCls} wrap gutter={[10, 10]}>
                    {Object.keys(icons).map((name) => {
                        return (
                            <FGridItem span={3}>
                                <Icon type={name} size={20} icons={icons} onClick={() => handleChange(name)}/>
                            </FGridItem>
                        );
                    })}
                </FGrid>
            );
        };

        return () => {
            return (
                <FTooltip mode="popover" placement="left" v-slots={{ content: renderIcons }}>
                    <div
                        class={wrapCls}
                        onMouseenter={() => { isHoverRef.value = true; }}
                        onMouseleave={() => { isHoverRef.value = false; }}
                    >
                        <div class={iconBoxCls}>
                            <Icon type={iconName.value} size={20} icons={icons} />
                        </div>
                        <div class={[iconName.value ? textCls : textNullCls]}>{iconName.value || props.placeholder}</div>
                        <input
                            class={inputCls}
                            readonly
                            value={iconName.value}
                        ></input>
                        <CloseCircleFilled
                            v-show={isHoverRef.value}
                            class={iconCls}
                            onClick={() => handleChange('')}
                        />
                    </div>
                </FTooltip>
            );
        };
    },
});

export const IconSetter: IPublicTypeSetter = {
    type: 'IconSetter',
    title: '图标设置器',
    Component: IconSetterView,
};
