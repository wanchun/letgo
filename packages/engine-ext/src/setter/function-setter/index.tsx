import type { PropType } from 'vue';
import { computed, defineComponent, onMounted } from 'vue';
import type { IPublicTypeJSFunction, IPublicTypeSetter } from '@webank/letgo-types';
import { javascript } from '@codemirror/lang-javascript';
import { isUndefined } from 'lodash-es';
import { CodeMirror } from '@webank/letgo-components';
import { commonProps } from '../../common';

const FunctionSetterView = defineComponent({
    name: 'FunctionSetterView',
    props: {
        ...commonProps,
        value: Object as PropType<IPublicTypeJSFunction>,
        defaultValue: Object as PropType<IPublicTypeJSFunction>,
        onChange: Function as PropType<(val: IPublicTypeJSFunction) => void>,
    },
    setup(props) {
        onMounted(() => {
            props.onMounted?.();
        });

        const currentValue = computed(() => {
            const val = isUndefined(props.value)
                ? props.defaultValue
                : props.value;
            return val?.value;
        });

        const onChange = (val: string) => {
            try {
                props.onChange({
                    type: 'JSFunction',
                    value: val,
                });
            }
            catch (e) {}
        };
        return () => {
            return (
                <CodeMirror
                    modelValue={currentValue.value}
                    onUpdate:modelValue={onChange}
                    basic={true}
                    tab={true}
                    extensions={[javascript()]}
                    tabSize={4}
                    placeholder={props.placeholder || 'Type your code here'}
                ></CodeMirror>
            );
        };
    },
});

export const FunctionSetter: IPublicTypeSetter = {
    type: 'FunctionSetter',
    title: '函数设置器',
    Component: FunctionSetterView,
};
