import type { PropType, VNodeChild } from 'vue';
import { computed, createVNode, defineComponent, h } from 'vue';
import type { IPublicTypeCustomView, IPublicTypeFieldDisplay } from '@webank/letgo-types';
import { isSetterConfig } from '@webank/letgo-types';
import { isFunction } from 'lodash-es';
import type { IFieldProps } from './fields';
import { AccordionFieldView, BlockFieldView, InlineFieldView, PlainFieldView, PopupFieldView } from './fields';
import type { SettingField } from './setting-field';
import { SetterManager } from './setter-manager';

export function createFieldContent(
    props: IFieldProps,
    children: VNodeChild,
    type?: IPublicTypeFieldDisplay,
) {
    if (type === 'plain' || !props.title)
        return h(PlainFieldView, props, () => children);

    if (type === 'popup')
        return h(PopupFieldView, props, () => children);

    if (type === 'block')
        return h(BlockFieldView, props, () => children);

    if (type === 'accordion')
        return h(AccordionFieldView, props, () => children);

    return h(InlineFieldView, props, () => children);
}

export function createSetterContent(
    setter: string | IPublicTypeCustomView,
    props: Record<string, any>,
): VNodeChild {
    if (typeof setter === 'string') {
        const _setter = SetterManager.getSetter(setter);
        if (!_setter)
            return null;

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
        const visible
            = (field.isSingle && typeof condition === 'function')
                ? condition(field) !== false
                : true;

        if (!visible)
            return null;

        return createFieldContent(
            {
                meta: field.componentMeta?.npm || field.componentMeta?.componentName || '',
                title: field.title,
                expanded: field.expanded,
                onExpandChange: expandState => field.setExpanded(expandState),
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
                _visible
                    = typeof condition === 'function'
                        ? condition(props.field) !== false
                        : true;
            }
            catch (error) {
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
        if (!visible)
            return;

        const { extraProps } = field;
        const { defaultValue } = extraProps;

        const { setter } = field;

        let _defaultValue: any = defaultValue;
        let setterProps: any = {};
        let setterType: string | IPublicTypeCustomView;

        if (Array.isArray(setter)) {
            setterType = 'MixedSetter';
            setterProps = {
                setters: setter,
            };
        }
        else if (isSetterConfig(setter)) {
            setterType = setter.componentName;
            if (setter.props) {
                setterProps = setter.props;
                if (typeof setterProps === 'function')
                    setterProps = setterProps(field);
            }
            if (setter.defaultValue)
                _defaultValue = setter.defaultValue;
        }
        else if (setter) {
            setterType = setter;
        }

        let value = null;
        if (field.valueState === -1) {
            setterProps.multiValue = true;
            if (!('placeholder' in setterProps))
                setterProps.placeholder = 'Multiple Value';
        }
        else {
            value = field.getValue();
        }

        // 根据是否支持变量配置做相应的更改
        const supportVariable = field.extraProps?.supportVariable;
        if (supportVariable) {
            if (setterType === 'MixedSetter') {
                if (
                    Array.isArray(setterProps.setters)
                    && !setterProps.setters.includes('ExpressionSetter')
                )
                    setterProps.setters.push('ExpressionSetter');
            }
            else {
                setterType = 'MixedSetter';
                setterProps = {
                    setters: [setter, 'ExpressionSetter'],
                };
            }
        }

        return createFieldContent(
            {
                meta: field.componentMeta?.npm || field.componentMeta?.componentName || '',
                title: field.title,
                expanded: field.expanded,
                onExpandChange: expandState => field.setExpanded(expandState),
                onClear: () => field.clearValue(),
                // TODO: 暂时不知道要干嘛
                // ...extraProps,
            },
            createSetterContent(setterType, {
                ...setterProps,
                field,
                node: field.top.getNode(),
                key: field.id,
                value,
                defaultValue: isFunction(_defaultValue)
                    ? _defaultValue(field)
                    : _defaultValue,
                onChange: (value: any) => {
                    field.setValue(value);
                },
                onMounted: () => {
                    // TODO
                },
            }),
            extraProps.display,
        );
    },
});

export function createSettingFieldView(item: SettingField): VNodeChild {
    if (item.isGroup)
        return [<SettingGroupView field={item} key={item.id} />];
    else
        return [<SettingFieldView field={item} key={item.id} />];
}
