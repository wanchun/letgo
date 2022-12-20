import { defineComponent, onMounted, PropType, computed } from 'vue';
import { Setter, FieldConfig, SetterType } from '@webank/letgo-types';
import { createSettingFieldView } from '@webank/letgo-designer';
import { commonProps } from '../../common/setter-props';
import { wrapperCls } from './index.css';

const ObjectSetterView = defineComponent({
    name: 'ObjectSetterView',
    props: {
        ...commonProps,
        value: Object,
        defaultValue: Object,
        items: Object as PropType<FieldConfig[]>,
        extraSetter: [String, Object, Array] as PropType<SetterType>,
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
            return (items || []).map((conf) =>
                field.createField({
                    ...conf,
                    setValue: extraProps?.setValue,
                }),
            );
        });

        return () => {
            return (
                <div class={wrapperCls}>
                    {items.value.map((item) => createSettingFieldView(item))}
                </div>
            );
        };
    },
});

export const ObjectSetter: Setter = {
    type: 'ObjectSetter',
    title: '对象设置器',
    Component: ObjectSetterView,
    condition: (field) => {
        const v = field.getValue();
        return typeof v === 'object';
    },
};
