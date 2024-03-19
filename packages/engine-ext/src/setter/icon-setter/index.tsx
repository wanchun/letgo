import type { PropType } from 'vue';
import { computed, defineComponent, onMounted, ref } from 'vue';
import { cloneDeep, isArray, isUndefined } from 'lodash-es';
import { isJSSlot } from '@webank/letgo-types';
import type { IPublicTypeJSSlot, IPublicTypeSetter } from '@webank/letgo-types';
import { Icon } from '@webank/letgo-components';
import { FGrid, FGridItem, FTooltip } from '@fesjs/fes-design';
import { CloseCircleFilled } from '@fesjs/fes-design/icon';
import { commonProps } from '../../common';
import './index.less';

interface IIcon {
    name: string;
    svg: string;
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
            type: Array as PropType<IIcon[]>,
            default: () => [] as IIcon[],
        },
        placeholder: {
            type: String,
            default: '请选择图标',
        },
    },
    setup(props) {
        onMounted(() => {
            props.onMounted?.();
        });

        const isHoverRef = ref(false);

        const icon = computed(() => {
            const val = isUndefined(props.value)
                ? cloneDeep(props.defaultValue)
                : props.value;

            if (isJSSlot(val)) {
                let firstNodeData: any;
                if (isArray(val.value) && val.value.length)
                    firstNodeData = val.value[0];
                else
                    firstNodeData = val.value;

                return firstNodeData?.props?.content;
            }

            return val;
        });

        const handleChange = (icon?: string) => {
            if (props.type === 'string') {
                props.onChange(icon);
            }
            else if (props.type === 'node') {
                props.onChange(icon
                    ? {
                            type: 'JSSlot',
                            value: {
                                componentName: 'Icon',
                                props: {
                                    content: icon,
                                },
                            },
                        }
                    : undefined);
            }
        };

        const renderIcons = () => {
            const icons = [...props.icons, ...IconSetter.defaultIcons];
            return (
                <FGrid class="letgo-color-setter__icons" wrap gutter={[10, 10]}>
                    {icons.map((item) => {
                        return (
                            <FGridItem span={3}>
                                <Icon content={item.svg} size={20} onClick={() => handleChange(item.svg)} />
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
                        class="letgo-color-setter"
                        onMouseenter={() => { isHoverRef.value = true; }}
                        onMouseleave={() => { isHoverRef.value = false; }}
                    >
                        {
                            icon.value
                                ? (
                                    <div class="letgo-color-setter__box">
                                        <Icon content={icon.value} size={20} />
                                    </div>
                                    )
                                : (
                                    <div class="letgo-color-setter__text--null">{props.placeholder}</div>
                                    )
                        }
                        <CloseCircleFilled
                            v-show={isHoverRef.value}
                            class="letgo-color-setter__icon"
                            onClick={() => handleChange()}
                        />
                    </div>
                </FTooltip>
            );
        };
    },
});

export const IconSetter: IPublicTypeSetter & { defaultIcons: IIcon[] } = {
    type: 'IconSetter',
    title: '图标设置器',
    Component: IconSetterView,
    defaultIcons: [],
};
