import { defineComponent, onMounted, PropType, computed } from 'vue';
import { Setter, FieldConfig, SetterType } from '@webank/letgo-types';
import { createSettingFieldView } from '@webank/letgo-designer';
import { commonProps } from '../../common/setter-props';

type ObjectSetterConfig = {
    items?: FieldConfig[];
    extraSetter?: SetterType;
};

const ObjectSetterView = defineComponent({
    name: 'ObjectSetterView',
    props: {
        ...commonProps,
        value: {
            type: Object,
        },
        defaultValue: {
            type: Object,
        },
        config: Object as PropType<ObjectSetterConfig>,
    },
    setup(props) {
        onMounted(() => {
            props.onMounted?.();
        });

        const items = computed(() => {
            const { config, field } = props;
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
            return ((config as ObjectSetterConfig)?.items || []).map((conf) =>
                field.createField({
                    ...conf,
                    setValue: extraProps?.setValue,
                }),
            );
        });

        return () => {
            return (
                <>{items.value.map((item) => createSettingFieldView(item))}</>
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
