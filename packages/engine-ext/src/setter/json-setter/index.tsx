import { computed, defineComponent, onMounted } from 'vue';
import type { IPublicTypeSetter } from '@webank/letgo-types';
import { json } from '@codemirror/lang-json';
import { isEqual, isNil, isUndefined } from 'lodash-es';
import { CodeEditor } from '@webank/letgo-components';
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

        let cache: string;

        const currentValue = computed(() => {
            const val = isUndefined(props.value)
                ? props.defaultValue
                : props.value;

            if (!isNil(cache) && isEqual(val, JSON.parse(cache)))
                return cache;

            return JSON.stringify(val, null, 2);
        });

        const onChange = (val: string) => {
            try {
                cache = val;
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
