import type { PropType } from 'vue';
import { computed, defineComponent, onMounted } from 'vue';
import type { IPublicTypeFieldConfig, IPublicTypeSetter, IPublicTypeSetterType } from '@harrywan/letgo-types';
import type { SettingField } from '@harrywan/letgo-designer';
import { isUndefined } from 'lodash-es';
import { createSettingFieldView } from '@harrywan/letgo-designer';
import { isJSExpression } from '@harrywan/letgo-types';
import { commonProps } from '../../common';
import  './index.less';

const ObjectSetterView = defineComponent({
    name: 'ObjectSetterView',
    props: {
        ...commonProps,
        value: Object,
        defaultValue: Object,
        items: Object as PropType<IPublicTypeFieldConfig[]>,
        extraSetter: [String, Object, Array] as PropType<IPublicTypeSetterType>,
    },
    setup(props) {
        onMounted(() => {
            props.onMounted?.();
        });

        const items = computed(() => {
            const { items, field } = props;
            const { extraProps } = field;
            if (Array.isArray(field.items) && field.items.length > 0) {
                field.items.forEach((item) => {
                    const originalSetValue = item.extraProps.setValue;
                    item.extraProps.setValue = (...args) => {
                        // 调用子字段本身的 setValue
                        originalSetValue?.(...args);
                        // 调用父字段本身的 setValue
                        extraProps.setValue?.(...args);
                    };
                });
                return field.items;
            }
            return (items || []).map(conf =>
                field.createField({
                    ...conf,
                    setValue: extraProps?.setValue,
                }),
            );
        });

        return () => {
            return (
                <div class="letgo-setter-object">
                    {items.value.map(item => createSettingFieldView(item))}
                </div>
            );
        };
    },
});

export const ObjectSetter: IPublicTypeSetter = {
    type: 'ObjectSetter',
    title: '对象设置器',
    Component: ObjectSetterView,
    condition: (field) => {
        const v = field.getValue() ?? (field as SettingField).getDefaultValue();
        if (isJSExpression(v))
            return false;
        return isUndefined(v) || typeof v === 'object';
    },
};
