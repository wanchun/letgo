import { h, defineComponent, PropType, computed } from 'vue';
import { CustomView, isSetterConfig } from '@webank/letgo-types';
import { VNode, createVNode } from 'vue';
import { IFieldProps, FieldView, PlainFieldView } from './fields';
import { SettingField } from './setting-field';
import { SetterFactory } from './setter-manager';

export function createFieldContent(
    props: IFieldProps,
    children: any[],
    type?: 'accordion' | 'inline' | 'block' | 'plain' | 'popup' | 'entry',
) {
    // if (type === 'popup') {
    //     return createVNode(PopupField, props, children);
    // }
    // if (type === 'entry') {
    //     return createVNode(EntryField, props, children);
    // }
    if (type === 'plain' || !props.title) {
        return h(PlainFieldView, {}, () => children);
    }
    return h(FieldView, { ...props, display: type }, () => children);
}

export function createSetterContent(
    setter: string | CustomView,
    props: Record<string, any>,
): VNode[] {
    if (typeof setter === 'string') {
        const _setter = SetterFactory.getSetter(setter);
        if (!_setter) {
            return null;
        }
        return [createVNode(_setter.Component, props)];
    }

    return setter(props);
}

export const SettingGroupView = defineComponent({
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

export const SettingFieldView = defineComponent({
    name: 'PluginSettingFieldView',
    props: {
        field: Object as PropType<SettingField>,
    },
    setup(props) {
        const visible = computed(() => {
            const condition = props.field.extraProps?.condition;
            let _visible = true;
            try {
                _visible =
                    typeof condition === 'function'
                        ? condition(props.field) !== false
                        : true;
            } catch (error) {
                _visible = false;
                console.error(
                    'exception when condition (hidden) is executed',
                    error,
                );
            }
            return _visible;
        });
        return {
            visible,
        };
    },
    render() {
        const { field, visible } = this;
        if (!visible) return;

        const { extraProps } = field;
        const { defaultValue } = extraProps;

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

export const createSettingFieldView = (item: SettingField) => {
    if (item.isGroup) {
        return <SettingGroupView field={item} key={item.id} />;
    } else {
        return <SettingFieldView field={item} key={item.id} />;
    }
};
