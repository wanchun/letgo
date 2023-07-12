import { computed, defineComponent, onMounted } from 'vue';
import type { IPublicTypeSetter } from '@fesjs/letgo-types';
import { json } from '@codemirror/lang-json';
import { isUndefined } from 'lodash-es';
import { CodeEditor } from '@fesjs/letgo-components';
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
                <CodeEditor
                    doc={currentValue.value}
                    changeDoc={onChange}
                    extensions={[json()]}
                ></CodeEditor>
            );
        };
    },
});

export const JsonSetter: IPublicTypeSetter = {
    type: 'JsonSetter',
    title: 'JSON设置器',
    Component: JsonSetterView,
};
