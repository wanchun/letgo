import { CodeEditor } from '@webank/letgo-components';
import type { IPublicTypeJSFunction, IPublicTypeSetter } from '@webank/letgo-types';
import { isJSFunction } from '@webank/letgo-types';
import { isFunction, isUndefined } from 'lodash-es';
import type { PropType } from 'vue';
import { computed, defineComponent, onMounted } from 'vue';
import { commonProps } from '../../common';

const FunctionSetterView = defineComponent({
    name: 'FunctionSetterView',
    props: {
        ...commonProps,
        value: Object as PropType<IPublicTypeJSFunction>,
        defaultValue: [Function, String],
        onChange: Function as PropType<(val?: IPublicTypeJSFunction) => void>,
    },
    setup(props) {
        onMounted(() => {
            props.onMounted?.();
        });

        const currentValue = computed(() => {
            return isUndefined(props.value)
                ? props.defaultValue?.toString()
                : props.value?.value;
        });

        const changeFunction = (code: string) => {
            if (code?.trim()) {
                props.onChange({
                    type: 'JSFunction',
                    value: code,
                });
            }
            else {
                // 清空
                props.onChange();
            }
        };

        return () => {
            return (
                <CodeEditor
                    documentModel={props.node.document}
                    doc={currentValue.value}
                    placeholder={props.placeholder || 'Please Enter Function'}
                    onChange={changeFunction}
                    compRef={props.node.ref}
                >
                </CodeEditor>
            );
        };
    },
});

export const FunctionSetter: IPublicTypeSetter = {
    type: 'FunctionSetter',
    title: '函数设置器',
    Component: FunctionSetterView,
    condition: (field) => {
        const v = field.getValue();
        const defaultValue = field.getDefaultValue();
        return isJSFunction(v) || isFunction(defaultValue);
    },
};
