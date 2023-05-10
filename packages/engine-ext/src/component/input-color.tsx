import { defineComponent } from 'vue';
import { useModel } from '@webank/letgo-utils';
import { inputCls, inputColorBoxCls, inputTextCls, inputTextNullCls, inputWrapCls } from './input-color.css';

export default defineComponent({
    props: {
        placeholder: {
            type: String,
            default: '请选择颜色',
        },
        modelValue: String,
    },
    emits: ['update:modelValue', 'change'],
    setup(props, { emit }) {
        const [currentValue, updateCurrentValue] = useModel(props, emit);

        return () => {
            return (
                <div class={inputWrapCls}>
                    <div class={inputColorBoxCls} style={{ backgroundColor: currentValue.value }}>
                    </div>
                    <div class={[currentValue.value ? inputTextCls : inputTextNullCls]}>{currentValue.value ?? props.placeholder}</div>
                    <input
                        class={inputCls}
                        type="color"
                        value={currentValue.value}
                        onInput={(event: any) => {
                            updateCurrentValue(event.target.value);
                        }}
                        onChange={(e) => { emit('change', e); }}
                    ></input>
                </div>
            );
        };
    },
});
