import { defineComponent, PropType } from 'vue';
import {
    SettingField,
    createFieldContent,
    createSetterContent,
} from '@webank/letgo-designer';
import { isSetterConfig, CustomView } from '@webank/letgo-types';
import { paneWrapperCls } from './pane.css';

const SettingGroupView = defineComponent({
    name: 'PluginSettingGroupView',
    props: {
        field: Object as PropType<SettingField>,
    },
    render() {
        const { field } = this;
        const { extraProps } = field;
        const { condition, display } = extraProps;
        const visible =
            field.isSingle && typeof condition === 'function'
                ? condition(field) !== false
                : true;

        if (!visible) {
            return null;
        }
        return createFieldContent(
            {
                title: field.title,
                collapsed: !field.expanded,
                onExpandChange: (expandState) => field.setExpanded(expandState),
            },
            field.items.map((item) => {
                return createSettingFieldView(item);
            }),
            display,
        );
    },
});

const SettingFieldView = defineComponent({
    name: 'PluginSettingFieldView',
    props: {
        field: Object as PropType<SettingField>,
    },
    render() {
        const { field } = this;
        const { extraProps } = field;
        const { condition, defaultValue } = extraProps;
        let visible;
        try {
            visible =
                typeof condition === 'function'
                    ? condition(field) !== false
                    : true;
        } catch (error) {
            console.error(
                'exception when condition (hidden) is executed',
                error,
            );
        }

        if (!visible) {
            return null;
        }

        const { setter } = field;

        let setterProps: any = {};
        let setterType: string | CustomView;

        if (Array.isArray(setter)) {
            setterType = 'MixedSetter';
            setterProps = {
                setters: setter,
            };
        } else if (isSetterConfig(setter)) {
            setterType = setter.componentName;
            if (setter.props) {
                setterProps = setter.props;
                if (typeof setterProps === 'function') {
                    setterProps = setterProps(field);
                }
            }
        } else if (setter) {
            setterType = setter;
        }

        let value = null;
        if (field.valueState === -1) {
            setterProps.multiValue = true;
            if (!('placeholder' in setterProps)) {
                setterProps.placeholder = 'Multiple Value';
            }
        } else {
            value = field.getValue();
        }

        // 根据是否支持变量配置做相应的更改
        const supportVariable = field.extraProps?.supportVariable;
        if (supportVariable) {
            if (setterType === 'MixedSetter') {
                // VariableSetter 不单独使用
                if (
                    Array.isArray(setterProps.setters) &&
                    !setterProps.setters.includes('VariableSetter')
                ) {
                    setterProps.setters.push('VariableSetter');
                }
            } else {
                setterType = 'MixedSetter';
                setterProps = {
                    setters: [setter, 'VariableSetter'],
                };
            }
        }

        return createFieldContent(
            {
                title: field.title,
                onExpandChange: (expandState) => field.setExpanded(expandState),
                onClear: () => field.clearValue(),
                ...extraProps,
            },
            createSetterContent(setterType, {
                ...setterProps,
                field: field,
                node: field.top.getNode(),
                key: field.id,
                value,
                defaultValue: defaultValue,
                onChange: (value: any) => {
                    field.setValue(value, true);
                },
                onMounted: () => {
                    // TODO
                },
            }),
            extraProps.forceInline ? 'plain' : extraProps.display,
        );
    },
});

const createSettingFieldView = (item: SettingField) => {
    if (item.isGroup) {
        return <SettingGroupView field={item} key={item.id} />;
    } else {
        return <SettingFieldView field={item} key={item.id} />;
    }
};

export default defineComponent({
    name: 'PluginSetterPaneView',
    props: {
        field: Object as PropType<SettingField>,
    },
    render() {
        const { field } = this;
        const { items } = field;
        return (
            <div class={paneWrapperCls}>
                {items.map((item) => createSettingFieldView(item))}
            </div>
        );
    },
});
