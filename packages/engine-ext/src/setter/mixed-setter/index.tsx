import type { PropType, Ref } from 'vue';
import { computed, defineComponent, ref } from 'vue';
import type {
    IPublicTypeCustomView,
    IPublicTypeDynamicProps,
    IPublicTypeSetter,
    IPublicTypeSetterType,
} from '@harrywan/letgo-types';
import {
    isSetterConfig,
} from '@harrywan/letgo-types';
import type { SettingField } from '@harrywan/letgo-designer';
import {
    SetterManager,
    createSetterContent,
} from '@harrywan/letgo-designer';
import { cloneDeep } from 'lodash';
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
                const setterInfo = SetterManager.getSetter(setter.componentName);
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
            const setterInfo = SetterManager.getSetter(config.setter);
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

        const cache = new Map<string, unknown>();

        const changeSetter = (value: string) => {
            // 缓存
            const setterName = currentSetterName.value;
            cache.set(setterName, cloneDeep(props.value));
            // 更改
            currentSetterName.value = value;
            // 变更
            const cacheValue = cache.get(value);
            if (cacheValue)
                props.onChange(cacheValue);
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
                        changeSetter('ExpressionSetter');

                    else
                        changeSetter(otherName);
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
                        changeSetter(val);
                    }}
                >
                    <Transform
                        class={iconCls}
                        theme="outline"
                        size="14"
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
