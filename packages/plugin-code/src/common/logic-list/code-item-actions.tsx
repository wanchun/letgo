import type { PropType } from 'vue';
import { defineComponent, h } from 'vue';
import { FDropdown } from '@fesjs/fes-design';
import { MoreOutlined } from '@fesjs/fes-design/icon';
import { cloneDeep } from 'lodash-es';
import type { IPublicModelCode } from '@webank/letgo-types';

const ItemActionOptions = [
    {
        value: 'duplicate',
        label: '复制',
    },
    {
        value: 'rename',
        label: '重命名',
    },
    {
        value: 'delete',
        label: () => h('span', {
            style: 'color: #ff4d4f',
        }, '删除'),
    },
];

export const CodeItemActions = defineComponent({
    props: {
        id: String,
        code: Object as PropType<IPublicModelCode>,
        onRename: Function as PropType<(id: string) => void>,
        onSelect: Function as PropType<((id?: string) => void)>,
        onDelete: Function as PropType<((id: string) => void)>,
    },
    setup(props) {
        const onCodeItemAction = (value: string) => {
            if (value === 'duplicate') {
                const targetCodeItem = props.code.getCodeItem(props.id);
                const newItem = cloneDeep(targetCodeItem);
                newItem.id = props.code.genCodeId(targetCodeItem.type);
                props.code.addCodeItem(newItem);
                props.onSelect(newItem.id);
            }
            else if (value === 'rename') {
                props.onRename(props.id);
            }
            else if (value === 'delete') {
                props.code.deleteCodeItem(props.id);
                props.onDelete(props.id);
            }
        };

        return () => {
            return (
                <FDropdown onClick={value => onCodeItemAction(value)} trigger="click" appendToContainer={false} placement="bottom-end" options={ItemActionOptions}>
                    <MoreOutlined class="letgo-logic-code__icon-more" />
                </FDropdown>
            );
        };
    },
});
