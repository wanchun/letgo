import type { PropType } from 'vue';
import { computed, defineComponent, onMounted } from 'vue';
import { isJSFunction } from '@webank/letgo-types';
import type { IPublicTypeJSFunction, IPublicTypeSetter } from '@webank/letgo-types';
import { isFunction, isUndefined } from 'lodash-es';
import { javascript } from '@codemirror/lang-javascript';
import { CodeEditor } from '@webank/letgo-components';
import { formatJsCode } from '@webank/letgo-common';
import { commonProps } from '../../common';

const FunctionSetterView = defineComponent({
    name: 'FunctionSetterView',
    props: {
        ...commonProps,
        value: Object as PropType<IPublicTypeJSFunction>,
        defaultValue: Function,
        onChange: Function as PropType<(val: IPublicTypeJSFunction) => void>,
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

        const onChange = (val: string) => {
            try {
                props.onChange({
                    type: 'JSFunction',
                    value: val,
                });
            }
            catch (e) {}
        };
        const onBlur = async (val: string) => {
            val = await formatJsCode(val, { tabWidth: 2 });
            onChange(val);
        };
        return () => {
            return (
                <CodeEditor
                    doc={currentValue.value}
                    changeDoc={onChange}
                    extensions={[javascript()]}
                    onBlur={onBlur}
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
        return isUndefined(v) || isJSFunction(v) || isFunction(defaultValue);
    },
};
