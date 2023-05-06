import type { PropType } from 'vue';
import type { Node, SettingField } from '@webank/letgo-designer';

export const commonProps = {
    field: Object as PropType<SettingField>,
    node: Object as PropType<Node>,
    placeholder: String,
    onMounted: Function as PropType<() => void>,
    onChange: Function as PropType<(val: any) => void>,
};
