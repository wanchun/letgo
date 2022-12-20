import { defineComponent, computed, ref, Ref, PropType } from 'vue';
import {
    Setter,
    isSetterConfig,
    DynamicProps,
    CustomView,
    SetterType,
} from '@webank/letgo-types';
import {
    SettingField,
    SetterFactory,
    createSetterContent,
} from '@webank/letgo-designer';
import { FDropdown } from '@fesjs/fes-design';
import { Switch } from '@icon-park/vue-next';
import { commonProps } from '../../common/setter-props';
import { wrapperCls, contentCls, actionsCls, iconCls } from './index.css';

type SetterItem = {
    name: string;
    title: string;
    setter: string | CustomView;
    props?: object | DynamicProps;
    condition?: (field: SettingField) => boolean;
    defaultValue?: any;
};

const normalizeSetters = (setters?: Array<SetterType>): SetterItem[] => {
    if (!setters) {
        return [];
    }
    const names: string[] = [];
    function generateName(n: string) {
        let idx = 1;
        let got = n;
        while (names.indexOf(got) > -1) {
            got = `${n}:${idx++}`;
        }
        names.push(got);
        return got;
    }
    const formattedSetters = setters.map((setter) => {
        const config: any = {
            setter,
        };
        if (isSetterConfig(setter)) {
            if (typeof setter.componentName === 'string') {
                const info = SetterFactory.getSetter(setter.componentName);
                config.name = info?.type || generateName('CustomSetter');
                config.title = setter.title || info?.title;
            } else {
                config.name = generateName('CustomSetter');
                config.title = setter.title;
            }
            config.setter = setter.componentName;
            config.props = setter.props;
            config.condition = setter.condition;
            config.defaultValue = setter.defaultValue;
        }
        if (typeof setter === 'string') {
            const info = SetterFactory.getSetter(config.setter);
            config.name = setter;
            if (!config.title) {
                config.title = info?.title || config.setter;
            }
            if (!config.condition) {
                config.condition = info?.condition;
            }
        }
        if (!config.title) {
            config.title = config.name;
        }
        return config;
    });
    const hasComplexSetter = formattedSetters.filter((item) =>
        ['ArraySetter', 'ObjectSetter'].includes(item.setter),
    ).length;
    return formattedSetters.map((item) => {
        if (item.setter === 'VariableSetter' && hasComplexSetter) {
            item.setter = 'ExpressionSetter';
            item.name = 'ExpressionSetter';
        }
        return item;
    });
};

const MixedSetterView = defineComponent({
    name: 'MixedSetterView',
    props: {
        ...commonProps,
        setters: Array as PropType<Array<SetterType>>,
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
        const currentSetterName: Ref<string> = ref();
        const setters = computed(() => {
            return normalizeSetters(props.setters);
        });
        const currentSetter = computed(() => {
            const { field } = props;
            let firstMatched: SetterItem | undefined;
            let firstDefault: SetterItem | undefined;
            for (const setter of setters.value) {
                if (setter.name === currentSetterName.value) {
                    return setter;
                }
                if (!setter.condition) {
                    if (!firstDefault) {
                        firstDefault = setter;
                    }
                    continue;
                }
                if (!firstMatched && setter.condition(field)) {
                    firstMatched = setter;
                }
            }
            return firstMatched || firstDefault || setters.value[0];
        });

        const renderCurrentSetter = (
            currentSetter?: SetterItem,
            extraProps?: object,
        ) => {
            const { field, ...restProps } = props;
            if (!currentSetter) {
                if (restProps.value == null) {
                    return <span>NullValue</span>;
                } else {
                    return <span>InvalidValue</span>;
                }
            }
            let setterProps: any = {};
            if (currentSetter.props) {
                setterProps = currentSetter.props;
                if (typeof setterProps === 'function') {
                    setterProps = setterProps(field);
                }
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
            return (
                <FDropdown
                    options={options}
                    onClick={(val: string) => {
                        currentSetterName.value = val;
                    }}
                >
                    <Switch
                        class={iconCls}
                        theme="outline"
                        size="14"
                        fill="#333"
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

export const MixedSetter: Setter = {
    type: 'MixedSetter',
    title: '混合设置器',
    Component: MixedSetterView,
};
