import type { PropType } from 'vue';
import { defineComponent, h } from 'vue';
import { FDropdown } from '@fesjs/fes-design';
import { PlusOutlined } from '@fesjs/fes-design/icon';
import { IEnumCodeType, IEnumResourceType, IPublicEnumPageLifecycle } from '@webank/letgo-types';
import { FolderIcon } from '@webank/letgo-components';
import { IconMap, ResourceTypeIcon } from '../constants';

export const AddAction = defineComponent({
    props: {
        extendActions: {
            type: Array as PropType<string[]>,
            default: (): string[] => [],
        },
        onAdd: Function as PropType<(value: string, params?: Record<string, any>) => void>,
        type: String as PropType<'page'>,
    },
    setup(props) {
        const options = [
            {
                value: IEnumCodeType.JAVASCRIPT_QUERY,
                label: '查询',
                icon: () => h(ResourceTypeIcon[IEnumResourceType.RESTQuery]),
            },
            {
                value: IEnumCodeType.JAVASCRIPT_FUNCTION,
                label: 'Js函数',
                icon: () => h(IconMap[IEnumCodeType.JAVASCRIPT_FUNCTION]),
            },
            {
                value: IEnumCodeType.TEMPORARY_STATE,
                label: '变量',
                icon: () => h(IconMap[IEnumCodeType.TEMPORARY_STATE]),
            },
            {
                value: IEnumCodeType.JAVASCRIPT_COMPUTED,
                label: '计算变量',
                icon: () => h(IconMap[IEnumCodeType.JAVASCRIPT_COMPUTED]),
            },
            props.type === 'page' && {
                value: IEnumCodeType.LIFECYCLE_HOOK,
                label: '生命周期',
                icon: () => h(IconMap[IEnumCodeType.LIFECYCLE_HOOK]),
            },
            props.extendActions.includes('directory') && {
                value: 'directory',
                label: '文件夹',
                icon: () => h(FolderIcon),
            },
        ].filter(Boolean);

        const addItem = (val: string) => {
            if (val === IEnumCodeType.JAVASCRIPT_QUERY) {
                props.onAdd(val, {
                    resourceType: IEnumResourceType.RESTQuery,
                });
                return;
            }
            if (val === IEnumCodeType.LIFECYCLE_HOOK) {
                if (props.type === 'page') {
                    props.onAdd(val, {
                        hookName: IPublicEnumPageLifecycle.Mounted,
                    });
                    return;
                }
            }
            props.onAdd(val);
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
