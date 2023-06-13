import { computed, defineComponent, onMounted } from 'vue';
import type { IPublicTypeSetter } from '@webank/letgo-types';
import { json } from '@codemirror/lang-json';
import { isUndefined } from 'lodash-es';
import { CodeMirror } from '@webank/letgo-components';
import { commonProps } from '../../common';

const JsonSetterView = defineComponent({
    name: 'JsonSetterView',
    props: {
        ...commonProps,
        value: Object,
        defaultValue: Object,
    },
    setup(props) {
        onMounted(() => {
            props.onMounted?.();
        });

        const currentValue = computed(() => {
            return JSON.stringify(isUndefined(props.value)
                ? props.defaultValue
                : props.value, null, 2);
        });

        const onChange = (val: string) => {
            try {
                props.onChange(JSON.parse(val));
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
                    tabSize={4}
                    extensions={[json()]}
                    lang={json()}
                    placeholder={props.placeholder || ''}
                ></CodeMirror>
            );
        };
    },
});

export const JsonSetter: IPublicTypeSetter = {
    type: 'JsonSetter',
    title: 'JSON设置器',
    Component: JsonSetterView,
};
