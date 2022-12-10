import { defineComponent, computed, ref, Ref, PropType } from 'vue';
import {
    Setter,
    SetterConfig,
    CustomView,
    isSetterConfig,
    DynamicProps,
} from '@webank/letgo-types';
import {
    SettingField,
    SetterFactory,
    createSetterContent,
    Node,
} from '@webank/letgo-designer';
import { FDropdown } from '@fesjs/fes-design';
import { Switch } from '@icon-park/vue-next';
import { wrapperCls, contentCls, actionsCls, iconCls } from './index.css';

type SetterType = string | SetterConfig | CustomView;

type SetterItem = {
    name: string;
    title: string;
    setter: string | CustomView;
    props?: object | DynamicProps;
    condition?: (field: SettingField) => boolean;
    defaultValue?: any | ((field: SettingField) => any);
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
            config.setter = setter.componentName;
            config.props = setter.props;
            config.condition = setter.condition;
            config.defaultValue = setter.defaultValue;
            config.title = setter.title;
        }
        if (typeof setter === 'string') {
            config.name = config.setter;
            names.push(config.name);
            const info = SetterFactory.getSetter(config.setter);
            if (!config.title) {
                config.title = info?.title || config.setter;
            }
        } else {
            config.name = generateName(
                (config.setter as any)?.displayName ||
                    (config.setter as any)?.name ||
                    'CustomSetter',
            );
            if (!config.title) {
                config.title = config.name;
            }
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
        field: Object as PropType<SettingField>,
        node: Object as PropType<Node>,
        setters: Array as PropType<Array<SetterType>>,
        onSetterChange: Function as PropType<
            (field: SettingField, name: string) => void
        >,
        onChange: Function as PropType<(val: any) => void>,
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
                ...setterProps,
                ...restProps,
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
                <FDropdown options={options}>
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