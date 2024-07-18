import JSON5 from 'json5';
import type { Monaco } from '@webank/letgo-components';
import { MonacoEditor } from '@webank/letgo-components';
import { engineConfig } from '@webank/letgo-editor-core';
import type { IPublicTypeSetter } from '@webank/letgo-types';
import { cloneDeep, isEqual, isNil, isUndefined } from 'lodash-es';
import { computed, defineComponent, onMounted, ref } from 'vue';
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

        const editorDidMount = (monaco: Monaco) => {
            monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                validate: false,
                allowComments: true,
                schemas: [],
                trailingCommas: 'ignore',
            });
        };

        const requireConfig = ref();
        engineConfig.onGot('requireConfig', (requireConfig: Record<string, any>) => {
            requireConfig.value = requireConfig;
        });

        return () => {
            return (
                <MonacoEditor
                    height="180px"
                    requireConfig={requireConfig.value}
                    options={{
                        glyphMargin: false,
                        lineNumbers: 'off',
                        contextmenu: false,
                    }}
                    language="json"
                    value={currentValue.value}
                    onChange={onChange}
                    editorDidMount={editorDidMount}
                    fullScreen
                    bordered
                >
                </MonacoEditor>
            );
        };
    },
});

export const JsonSetter: IPublicTypeSetter = {
    type: 'JsonSetter',
    title: 'JSON设置器',
    Component: JsonSetterView,
};
