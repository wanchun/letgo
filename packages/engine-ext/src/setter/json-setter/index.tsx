import JSON5 from 'json5';
import { json } from '@codemirror/lang-json';
import { CodeMirror } from '@webank/letgo-components';
import type { IPublicTypeSetter } from '@webank/letgo-types';
import { cloneDeep, isEqual, isNil, isUndefined } from 'lodash-es';
import { computed, defineComponent, onMounted } from 'vue';
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
                ? cloneDeep(props.defaultValue)
                : props.value;

            if (!isNil(cache) && isEqual(val, JSON5.parse(cache)))
                return cache;

            return JSON5.stringify(val, null, 2);
        });

        const onChange = (val: string) => {
            try {
                cache = val;
                props.onChange(JSON5.parse(val));
            }
            catch (e) {}
        };

        return () => {
            return (
                <CodeMirror
                    doc={currentValue.value}
                    onChange={onChange}
                    placeholder={props.placeholder || 'Please Enter JSON'}
                    extensions={[json()]}
                >
                </CodeMirror>
            );
        };
    },
});

export const JsonSetter: IPublicTypeSetter = {
    type: 'JsonSetter',
    title: 'JSON设置器',
    Component: JsonSetterView,
};
