import type { PropType } from 'vue';
import { computed, defineComponent, ref } from 'vue';
import { FDropdown, FForm, FFormItem, FInput, FModal } from '@fesjs/fes-design';
import type { INode } from '@webank/letgo-designer';
import { Delete, Edit, Lock, MoreOne, Unlock } from '@icon-park/vue-next';
import { nodeIconCls, suffixWrapperCls } from './index.css';

export const SuffixView = defineComponent({
    name: 'SuffixView',
    props: {
        node: Object as PropType<INode>,
    },
    setup(props) {
        const options = computed(() => {
            const node = props.node;
            return [
                {
                    value: 'change',
                    label: '修改',
                    icon: () => <Edit class={nodeIconCls} theme="outline"> </Edit>,
                },
                (node.componentName !== 'Page' && node.isContainer() && !node.isLocked) && {
                    value: 'lock',
                    label: '锁定',
                    icon: () => <Lock class={nodeIconCls} theme="outline"> </Lock>,
                },
                (node.componentName !== 'Page' && node.isContainer() && node.isLocked) && {
                    value: 'unlock',
                    label: '解锁',
                    icon: () => <Unlock class={nodeIconCls} theme="outline"> </Unlock>,
                },
                node.componentName !== 'Page' && {
                    value: 'delete',
                    label: '删除',
                    icon: () => <Delete class={nodeIconCls} theme="outline"> </Delete>,
                },
            ].filter(Boolean);
        });

        const isEdit = ref(false);

        const onClick = (val: string) => {
            const node = props.node;
            if (val === 'change')
                isEdit.value = true;

            if (val === 'delete')
                node.remove();

            if (val === 'lock')
                node.setExtraPropValue('isLocked', true);

            if (val === 'unlock')
                node.setExtraPropValue('isLocked', false);
        };

        const title = ref(props.node.title);

        const nodeRef = ref(props.node.ref);

        const onOk = () => {
            isEdit.value = false;
            // TODO: 检验
            props.node.props.getExtraProp('title').setValue(title.value);
            props.node.changeRef(nodeRef.value);
        };

        const onCancel = () => {
            isEdit.value = false;
        };

        return () => {
            return (
                <div class={suffixWrapperCls}>
                    <FDropdown options={options.value} onClick={onClick}>
                        <MoreOne class={nodeIconCls} theme="outline" />
                    </FDropdown>
                    <FModal v-model:show={isEdit.value} title="编辑" width={400} onOk={onOk} onCancel={onCancel}>
                        <FForm labelWidth={50}>
                            <FFormItem label='名称' prop='title'>
                                <FInput v-model={title.value} placeholder='请输入'/ >
                            </FFormItem>
                            <FFormItem label='英文名' prop='ref'>
                                <FInput v-model={nodeRef.value} placeholder='请输入'/ >
                            </FFormItem>
                        </FForm>
                    </FModal>
                </div>
            );
        };
    },
});
