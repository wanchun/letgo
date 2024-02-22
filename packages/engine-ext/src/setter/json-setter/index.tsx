import { json } from '@codemirror/lang-json';
import { CodeMirror } from '@webank/letgo-components';
import type { IPublicTypeSetter } from '@webank/letgo-types';
import { isEqual, isNil, isUndefined } from 'lodash-es';
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
                <CodeMirror
                    doc={currentValue.value}
                    onChange={onChange}
                    placeholder={props.placeholder}
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
