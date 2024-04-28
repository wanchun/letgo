import { FInput } from '@fesjs/fes-design';
import { Edit } from '@icon-park/vue-next';
import type { IPublicTypeSetter } from '@webank/letgo-types';
import { isUndefined } from 'lodash-es';
import type { PropType } from 'vue';
import { computed, defineComponent, onMounted, ref } from 'vue';
import { commonProps } from '../../common';
import './index.less';

const GridPresetTypes = [
    { label: '24', value: '24' },
    { label: '12:12', value: '12:12' },
    { label: '6:18', value: '6:18' },
    { label: '18:6', value: '18:6' },
    { label: '8:8:8', value: '8:8:8' },
    { label: '6:12:6', value: '6:12:6' },
    { label: '6:6:6:6', value: '6:6:6:6' },
    { label: '4:4:4:4:4', value: '4:4:4:4:4' },
];

const clsPrefix = 'letgo-ratio-setter__';

const RatioSetterView = defineComponent({
    name: 'RatioSetterView',
    props: {
        ...commonProps,
        value: String,
        defaultValue: String,
        options: {
            type: Array as PropType<typeof GridPresetTypes>,
        },
    },
    setup(props) {
        onMounted(() => {
            props.onMounted?.();
        });

        const currVal = ref(isUndefined(props.value) ? props.defaultValue : props.value);

        const doChange = (val: string) => {
            currVal.value = val;
            props.onChange(val);
        };

        const options = computed(() => {
            return props.options || GridPresetTypes;
        });

        return () => {
            return (
                <div>
                    <div class={`${clsPrefix}legend-body`}>
                        {options.value.map(item => (
                            <div title={item.value} class={{ [`${clsPrefix}legend-item`]: true, [`${clsPrefix}legend-checked`]: currVal.value === item.value }} key={item.value} onClick={() => doChange(item.value)}>
                                {item.value && item.value.split(':').map(item => <div class={`${clsPrefix}legend-sub-item`} style={{ flex: item }}></div>)}
                            </div>
                        ))}

                        <div
                            title="自定义"
                            v-show={options.value.every(item => item.value !== currVal.value.trim())}
                            class={`${clsPrefix}legend-item ${clsPrefix}legend-checked`}
                            style="align-items: center; background: #eee"
                        >
                            <Edit theme="outline" size="14" fill="#333" />
                        </div>
                    </div>
                    <FInput
                        modelValue={currVal.value}
                        placeholder={props.placeholder || ''}
                        onInput={(val: any) => doChange(val)}
                        style={{ width: '100%' }}
                    />
                </div>
            );
        };
    },
});

export const RatioSetter: IPublicTypeSetter = {
    type: 'RatioSetter',
    title: '比例设置器',
    Component: RatioSetterView,
    condition: (field) => {
        const v = field.getValue() ?? (field).getDefaultValue();
        return typeof v === 'string';
    },
};
