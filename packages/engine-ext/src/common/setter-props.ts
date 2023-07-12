import type { PropType } from 'vue';
import type { INode, SettingField } from '@fesjs/letgo-designer';

export const commonProps = {
    field: Object as PropType<SettingField>,
    node: Object as PropType<INode>,
    placeholder: String,
    onMounted: Function as PropType<() => void>,
    onChange: Function as PropType<(val: any) => void>,
};
