import { FSelect } from '@fesjs/fes-design';
import type { IPublicTypeSetter, IPublicTypeSetterConfig } from '@webank/letgo-types';
import type { PropType } from 'vue';
import { isArray, isString, isUndefined } from 'lodash-es';
import { computed, defineComponent, onMounted } from 'vue';
import { toJSON } from '../../common/css-json';
import { commonProps } from '../../common';

const ClassNameSetterView = defineComponent({
    name: 'ClassNameSetterView',
    props: {
        ...commonProps,
        value: [Object, String],
        defaultValue: String,
        extraSetter: {
            type: Object as PropType<IPublicTypeSetterConfig>,
        },
    },
    setup(props) {
        const project = props.field.designer.project;

        const options = computed(() => {
            const css = toJSON(project.css, {
                split: true,
                ordered: false,
                comments: false,
                stripComments: false,
            });

            const names: string[] = [];

            Object.keys(css.children).filter(key => key.startsWith('.')).forEach((item) => {
                const arr = item.split('.');
                arr.forEach((key) => {
                    if (key && !names.includes(key))
                        names.push(key);
                });
            });

            return names.map((item) => {
                return {
                    value: item,
                    label: item,
                };
            });
        });

        const onChange = (val: string) => {
            props.onChange(val);
        };

        onMounted(() => {
            props.onMounted?.();
        });

        return () => {
            return (
                <FSelect
                    modelValue={
                        isUndefined(props.value)
                            ? props.defaultValue
                            : props.value
                    }
                    options={options.value}
                    onChange={onChange}
                    multiple
                >
                </FSelect>
            );
        };
    },
});

export const ClassNameSetter: IPublicTypeSetter = {
    type: 'ClassNameSetter',
    title: '类名设置器',
    Component: ClassNameSetterView,
    condition: (field) => {
        const v = field.getValue() ?? (field).getDefaultValue();
        return isString(v) || isArray(v);
    },
};
