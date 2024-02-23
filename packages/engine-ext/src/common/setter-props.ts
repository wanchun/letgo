import type { INode, SettingField } from '@webank/letgo-designer';
import type { PropType } from 'vue';

export const commonProps = {
    field: Object as PropType<SettingField>,
    node: Object as PropType<INode>,
    placeholder: String,
    onMounted: Function as PropType<() => void>,
    onChange: Function as PropType<(val?: any) => void>,
};
