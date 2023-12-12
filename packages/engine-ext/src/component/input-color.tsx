import { defineComponent } from 'vue';
import { NColorPicker, NConfigProvider } from 'naive-ui';
import { useModel } from '@harrywan/letgo-common';
import  './input-color.less';

export default defineComponent({
    props: {
        defaultValue: String,
        modelValue: String,
    },
    emits: ['update:modelValue', 'change'],
    setup(props, { emit }) {
        const [currentValue, updateCurrentValue] = useModel(props, emit);

        const onChange = (val: string) => {
            updateCurrentValue(val || undefined);
            emit('change', val || undefined);
        };

        return () => {
            return (
                <NConfigProvider preflight-style-disabled>
                    <NColorPicker
                        class="letgo-input-color"
                        actions={['clear']}
                        defaultValue={props.defaultValue}
                        value={currentValue.value}
                        onUpdate:value={onChange}
                    >
                    </NColorPicker>
                </NConfigProvider>
            );
        };
    },
});
