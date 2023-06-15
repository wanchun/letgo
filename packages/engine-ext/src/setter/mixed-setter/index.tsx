import type { PropType, Ref } from 'vue';
import { computed, defineComponent, ref } from 'vue';
import type {
    IPublicTypeCustomView,
    IPublicTypeDynamicProps,
    IPublicTypeSetter,
    IPublicTypeSetterType,
} from '@webank/letgo-types';
import {
    isSetterConfig,
} from '@webank/letgo-types';
import type { SettingField } from '@webank/letgo-designer';
import {
    SetterFactory,
    createSetterContent,
} from '@webank/letgo-designer';
import { FDropdown, FTooltip } from '@fesjs/fes-design';
import { CodeBrackets, Transform } from '@icon-park/vue-next';
import { commonProps } from '../../common';
import { actionsCls, contentCls, iconCls, isActive, wrapperCls } from './index.css';

interface SetterItem {
    name: string
    title: string
    setter: string | IPublicTypeCustomView
    props?: object | IPublicTypeDynamicProps
    condition?: (field: SettingField) => boolean
    defaultValue?: any
}

function normalizeSetters(setters?: Array<IPublicTypeSetterType>): SetterItem[] {
    if (!setters)
        return [];

    const names: string[] = [];
    function generateName(n: string) {
        let idx = 1;
        let got = n;
        while (names.includes(got))
            got = `${n}:${idx++}`;

        names.push(got);
        return got;
    }
    const formattedSetters = setters.map((setter) => {
        const config: any = {
            setter,
        };
        if (isSetterConfig(setter)) {
            if (typeof setter.componentName === 'string') {
                const setterInfo = SetterFactory.getSetter(setter.componentName);
                config.name = setterInfo?.type || generateName('CustomSetter');
                config.title = setter.title || setterInfo?.title;
                config.condition = setter.condition || setterInfo?.condition;
            }
            else {
                config.name = generateName('CustomSetter');
                config.title = setter.title;
                config.condition = setter.condition;
            }
            config.setter = setter.componentName;
            config.props = setter.props;
            config.defaultValue = setter.defaultValue;
        }
        if (typeof setter === 'string') {
            const setterInfo = SetterFactory.getSetter(config.setter);
            config.name = setter;
            if (!config.title)
                config.title = setterInfo?.title || config.setter;

            if (!config.condition)
                config.condition = setterInfo?.condition;
        }
        if (!config.title)
            config.title = config.name;

        return config;
    });
    return formattedSetters;
}

const MixedSetterView = defineComponent({
    name: 'MixedSetterView',
    props: {
        ...commonProps,
        setters: Array as PropType<Array<IPublicTypeSetterType>>,
        onSetterChange: Function as PropType<
            (field: SettingField, name: string) => void
        >,
        value: {
            type: [
                String,
                Number,
                Boolean,
                Array,
                Object,
                Date,
                Function,
                Symbol,
            ],
            default: undefined,
        },
        defaultValue: {
            type: [
                String,
                Number,
                Boolean,
                Array,
                Object,
                Date,
                Function,
                Symbol,
            ],
            default: undefined,
        },
    },
    setup(props) {
        const setters = computed(() => {
            return normalizeSetters(props.setters);
        });

        const getDefaultSetterName = () => {
            const { field } = props;
            let firstMatched: SetterItem | undefined;
            let firstDefault: SetterItem | undefined;
            for (const setter of setters.value) {
                if (!setter.condition) {
                    if (!firstDefault)
                        firstDefault = setter;

                    continue;
                }
                if (!firstMatched && setter.condition(field))
                    firstMatched = setter;
            }
            return (firstMatched || firstDefault || setters.value[0])?.name;
        };

        const currentSetterName: Ref<string> = ref(getDefaultSetterName());

        const currentSetter = computed(() => {
            return setters.value.find((setter) => {
                return setter.name === currentSetterName.value;
            });
        });

        const renderCurrentSetter = (
            currentSetter?: SetterItem,
            extraProps?: object,
        ) => {
            const { field, setters, onSetterChange, ...restProps } = props;
            if (!currentSetter) {
                if (restProps.value == null)
                    return <span>NullValue</span>;

                else
                    return <span>InvalidValue</span>;
            }
            let setterProps: any = {};
            if (currentSetter.props) {
                setterProps = currentSetter.props;
                if (typeof setterProps === 'function')
                    setterProps = setterProps(field);
            }

            return createSetterContent(currentSetter.setter, {
                field,
                ...restProps,
                ...setterProps,
                ...extraProps,
            });
        };

        const renderSwitchAction = () => {
            const options = setters.value.map((setter) => {
                return {
                    value: setter.name,
                    label: setter.title,
                };
            });
            if (options.length === 2 && options.some(item => item.value === 'ExpressionSetter')) {
                const otherName = options.filter(item => item.value !== 'ExpressionSetter')[0].value;
                const onClick = () => {
                    if (currentSetterName.value !== 'ExpressionSetter')
                        currentSetterName.value = 'ExpressionSetter';

                    else
                        currentSetterName.value = otherName;
                };
                return (
                    <FTooltip content={currentSetterName.value === 'ExpressionSetter' ? '关闭' : '启用表达式'}>
                        <CodeBrackets
                            onClick={onClick}
                            class={[iconCls, currentSetterName.value === 'ExpressionSetter' && isActive]}
                            theme="outline"
                            size="14"
                        />
                    </FTooltip>
                );
            }
            return (
                <FDropdown
                    options={options}
                    onClick={(val: string) => {
                        currentSetterName.value = val;
                    }}
                >
                    <Transform
                        class={iconCls}
                        theme="outline"
                        size="14"
                        strokeWidth={2}
                    />
                </FDropdown>
            );
        };

        return () => {
            return (
                <div class={wrapperCls}>
                    <div class={contentCls}>
                        {renderCurrentSetter(currentSetter.value)}
                    </div>
                    <div class={actionsCls}>{renderSwitchAction()}</div>
                </div>
            );
        };
    },
});

export const MixedSetter: IPublicTypeSetter = {
    type: 'MixedSetter',
    title: '混合设置器',
    Component: MixedSetterView,
};
