import { defineComponent } from 'vue';
import { useModel } from '@webank/letgo-utils';
import { inputCls } from './input-color.css';

export default defineComponent({
    props: {
        modelValue: String,
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        const [currentValue, updateCurrentValue] = useModel(props, emit);

        return () => {
            return (
                <input
                    class={inputCls}
                    type="color"
                    value={currentValue.value}
                    onInput={(event: any) => {
                        updateCurrentValue(event.target.value);
                    }}
                ></input>
            );
        };
    },
});
