import type { PropType } from 'vue';
import { Fragment, computed, defineComponent, h } from 'vue';
import type { DropdownProps } from '@fesjs/fes-design';
import { FDropdown, FModal } from '@fesjs/fes-design';
import { MoreOutlined } from '@fesjs/fes-design/icon';
import type { IEnumCodeType, IEnumResourceType, IPublicModelCode } from '@webank/letgo-types';
import { AddAction } from './add';

const FolderActionOptions = [
    {
        value: 'rename',
        label: '重命名',
    },
    {
        value: 'unground',
        label: '解除归类',
    },
    {
        value: 'delete',
        label: () => h('span', {
            style: 'color: #ff4d4f',
        }, '删除'),
    },
] as const;

export const DirectoryActions = defineComponent({
    props: {
        id: String,
        code: Object as PropType<IPublicModelCode>,
        extendActions: {
            type: Array as PropType<string[]>,
            default: (): string[] => [],
        },
        onAdd: Function as PropType<(id: string) => void>,
        onRename: Function as PropType<(id: string) => void>,
        onSelect: Function as PropType<((id?: string) => void)>,
        onDelete: Function as PropType<((id: string | string[]) => void)>,
    },
    setup(props) {
        const currentFolder = computed(() => {
            return props.code.getDirectory(props.id);
        });
        const options = computed<DropdownProps['options']>((oldValue) => {
            if (!currentFolder.value)
                return oldValue;

            if (currentFolder.value.code.length === 0) {
                if (oldValue?.length === 2)
                    return oldValue;

                return FolderActionOptions.filter(item => item.value !== 'unground');
            }
            if (oldValue?.length === 3)
                return oldValue;

            return FolderActionOptions;
        });

        const onAction = (value: string) => {
            if (value === 'rename') {
                props.onRename(props.id);
            }
            else if (value === 'unground') {
                props.code.ungroundDirectory(props.id);
                props.onDelete(props.id);
            }
            else if (value === 'delete') {
                if (currentFolder.value.code.length === 0) {
                    props.code.deleteDirectory(props.id);
                    props.onDelete(props.id);
                }
                else {
                    const codeItemIds = currentFolder.value.code.map(item => item.id);
                    FModal.confirm({
                        title: `这些逻辑 ${codeItemIds.join(', ')} 将随着一起删除`,
                        onOk() {
                            props.code.deleteDirectory(props.id);
                            props.onDelete(codeItemIds.concat(props.id));
                        },
                    });
                }
            }
        };

        const addCodeItem = (val: string, codeType?: IEnumCodeType) => {
            if (codeType) {
                const item = props.code.addCodeItemInDirectory(props.id, codeType, val as IEnumResourceType);
                props.onSelect(item.id);
            }
            else {
                const item = props.code.addCodeItemInDirectory(props.id, val as IEnumCodeType);
                props.onSelect(item.id);
            }

            props.onAdd(props.id);
        };

        return () => {
            return (
                <Fragment>
                    <AddAction extendActions={props.extendActions} onAdd={addCodeItem} />
                    <FDropdown onClick={value => onAction(value)} trigger="click" placement="bottom-end" options={options.value}>
                        <MoreOutlined class="letgo-logic-code__icon-more" />
                    </FDropdown>
                </Fragment>
            );
        };
    },
});
