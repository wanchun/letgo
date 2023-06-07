import { defineComponent, ref } from 'vue';
import { CloseCircleFilled } from '@fesjs/fes-design/icon';
import { useModel } from '@webank/letgo-common';
import { iconCls, inputCls, inputColorBoxCls, inputTextCls, inputTextNullCls, inputWrapCls } from './input-color.css';

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

        const isHoverRef = ref(false);

        const onClear = () => {
            currentValue.value = undefined;
        };

        return () => {
            return (
                <div
                    class={inputWrapCls}
                    onMouseenter={() => { isHoverRef.value = true; }}
                    onMouseleave={() => { isHoverRef.value = false; }}
                >
                    <div class={inputColorBoxCls} style={{ backgroundColor: currentValue.value }}>
                    </div>
                    <div class={[currentValue.value ? inputTextCls : inputTextNullCls]}>{currentValue.value || props.placeholder}</div>
                    <input
                        class={inputCls}
                        type="color"
                        value={currentValue.value}
                        onInput={(event: any) => {
                            updateCurrentValue(event.target.value);
                        }}
                        onChange={(e) => { emit('change', e); }}
                    ></input>
                    <CloseCircleFilled
                        v-show={isHoverRef.value}
                        class={iconCls}
                        onClick={onClear}
                    />
                </div>
            );
        };
    },
});
