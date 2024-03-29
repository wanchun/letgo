import type { PropType } from 'vue';
import { defineComponent, h } from 'vue';
import { FDropdown } from '@fesjs/fes-design';
import { PlusOutlined } from '@fesjs/fes-design/icon';
import { IEnumCodeType, IEnumResourceType } from '@webank/letgo-types';
import { IconMap, ResourceTypeIcon } from '../constants';
import { FolderIcon } from '../../icons';

export const AddAction = defineComponent({
    props: {
        extendActions: {
            type: Array as PropType<string[]>,
            default: (): string[] => [],
        },
        onAdd: Function as PropType<(value: string, codeType?: IEnumCodeType) => void>,
    },
    setup(props) {
        const options = [
            props.extendActions.includes(IEnumCodeType.JAVASCRIPT_QUERY) && {
                value: IEnumResourceType.RESTQuery,
                codeType: IEnumCodeType.JAVASCRIPT_QUERY,
                label: '查询',
                icon: () => h(ResourceTypeIcon[IEnumResourceType.RESTQuery]),
            },
            {
                value: IEnumCodeType.JAVASCRIPT_FUNCTION,
                label: 'Js函数',
                icon: () => h(IconMap[IEnumCodeType.JAVASCRIPT_FUNCTION]),
            },
            {
                value: IEnumCodeType.JAVASCRIPT_COMPUTED,
                label: '计算变量',
                icon: () => h(IconMap[IEnumCodeType.JAVASCRIPT_COMPUTED]),
            },
            {
                value: IEnumCodeType.TEMPORARY_STATE,
                label: '变量',
                icon: () => h(IconMap[IEnumCodeType.TEMPORARY_STATE]),
            },
            props.extendActions.includes('directory') && {
                value: 'directory',
                label: '文件夹',
                icon: () => h(FolderIcon),
            },
        ].filter(Boolean);

        const addItem = (val: string) => {
            const option = options.find(item => item.value === val);

            props.onAdd(val, option.codeType);
        };

        return () => {
            return (
                <FDropdown
                    trigger="click"
                    onClick={addItem}
                    placement="bottom-start"
                    options={options}
                    appendToContainer={false}
                >
                    <PlusOutlined class="letgo-logic-code__header-icon" />
                </FDropdown>
            );
        };
    },
});
