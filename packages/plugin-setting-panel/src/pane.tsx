import { defineComponent, PropType } from 'vue';
import {
    SettingField,
    SettingEntry,
    isSettingField,
    createFieldContent,
    createSetterContent,
} from '@webank/letgo-designer';
import { CustomView, isSetterConfig } from '@webank/letgo-types';
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
            field.items.map((item, index) => {
                return createSettingFieldView(item, index, field);
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
                'exception when condition (hidden) is excuted',
                error,
            );
        }

        if (!visible) {
            return null;
        }

        const { setter } = field;

        let setterProps: any = {};
        let setterType: any;
        let initialValue: any = null;

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
            if (setter.defaultValue != null) {
                initialValue = setter.defaultValue;
            }
        } else if (setter) {
            setterType = setter;
        }

        let value = null;
        if (defaultValue != null && !('defaultValue' in setterProps)) {
            setterProps.defaultValue = defaultValue;
            if (initialValue == null) {
                initialValue = defaultValue;
            }
        }
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
                key: field.id,
                value,
                initialValue,
                onChange: (value: any) => {},
                onInitial: () => {},
                removeProp: () => {},
            }),
            extraProps.forceInline ? 'plain' : extraProps.display,
        );
    },
});

const createSettingFieldView = (
    item: SettingField | CustomView,
    index: number,
    field: SettingEntry,
) => {
    if (isSettingField(item)) {
        if (item.isGroup) {
            return <SettingGroupView field={item} key={item.id} />;
        } else {
            return <SettingFieldView field={item} key={item.id} />;
        }
    } else {
        return item({ item, index, field });
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
                {items.map((item, index) =>
                    createSettingFieldView(item, index, field),
                )}
            </div>
        );
    },
});
