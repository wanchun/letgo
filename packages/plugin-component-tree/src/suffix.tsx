import type { PropType } from 'vue';
import { computed, defineComponent, reactive, ref } from 'vue';
import { FDropdown, FForm, FFormItem, FInput, FModal } from '@fesjs/fes-design';
import type { INode } from '@webank/letgo-designer';
import { Delete, Edit, Lock, MoreOne, Unlock } from '@icon-park/vue-next';

export const SuffixView = defineComponent({
    name: 'SuffixView',
    props: {
        node: Object as PropType<INode>,
    },
    setup(props) {
        const options = computed(() => {
            const node = props.node;
            const isRoot = (node.componentName === 'Page' || node.componentName === 'Component');
            const isSlot = node.componentName === 'Slot';
            const isContainer = node.isContainer();
            const isLocked = node.isLocked;
            return [
                {
                    value: 'change',
                    label: '修改',
                    icon: () => <Edit class="letgo-comp-tree__icon letgo-comp-tree__icon--node" theme="outline"> </Edit>,
                },
                (!isRoot && isContainer && !isLocked) && {
                    value: 'lock',
                    label: '锁定',
                    icon: () => <Lock class="letgo-comp-tree__icon letgo-comp-tree__icon--node" theme="outline"> </Lock>,
                },
                (!isRoot && isContainer && isLocked) && {
                    value: 'unlock',
                    label: '解锁',
                    icon: () => <Unlock class="letgo-comp-tree__icon letgo-comp-tree__icon--node" theme="outline"> </Unlock>,
                },
                (!isRoot && !isSlot) && {
                    value: 'delete',
                    label: '删除',
                    icon: () => <Delete class="letgo-comp-tree__icon letgo-comp-tree__icon--node" theme="outline"> </Delete>,
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

        const formModel = reactive({
            title: props.node.title,
            ref: props.node.ref,
        });
        const formRef = ref();
        const onOk = async () => {
            if (await formRef.value.validate()) {
                isEdit.value = false;
                props.node.props.getExtraProp('title').setValue(formModel.title);
                props.node.changeRef(formModel.ref);
            }
        };

        const onCancel = () => {
            isEdit.value = false;
        };

        const formRules = {
            ref: {
                required: true,
                asyncValidator(rule: any, value: string) {
                    if (!/^[a-zA-Z_][a-zA-Z_0-9]*$/.test(value))
                        // eslint-disable-next-line prefer-promise-reject-errors
                        return Promise.reject('必须英文字母开头，只能包含字母、数字');

                    return Promise.resolve();
                },
            },
        };

        return () => {
            return (
                <div class="letgo-comp-tree__suffix">
                    <FDropdown options={options.value} onClick={onClick}>
                        <MoreOne class="letgo-comp-tree__icon letgo-comp-tree__icon--node" theme="outline" />
                    </FDropdown>
                    <FModal v-model:show={isEdit.value} title="编辑" width={400} onOk={onOk} onCancel={onCancel}>
                        <FForm ref={formRef} model={formModel} labelWidth={60} rules={formRules} >
                            <FFormItem label='名称' prop='title'>
                                <FInput v-model={formModel.title} placeholder='请输入'/ >
                            </FFormItem>
                            <FFormItem label='英文名' prop='ref'>
                                <FInput v-model={formModel.ref} placeholder='请输入'/ >
                            </FFormItem>
                        </FForm>
                    </FModal>
                </div>
            );
        };
    },
});
