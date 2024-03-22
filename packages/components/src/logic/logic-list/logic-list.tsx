import type { PropType } from 'vue';
import { computed, defineComponent, h, reactive, ref } from 'vue';
import type { TreeProps } from '@fesjs/fes-design';
import { FTree } from '@fesjs/fes-design';

import type { ICodeItem, ICodeItemOrDirectory, IPublicModelCode } from '@webank/letgo-types';
import { IEnumCodeType, isDirectory } from '@webank/letgo-types';
import { isNil } from 'lodash-es';
import { FolderIcon } from '../../icons';
import { IconMap, ResourceTypeIcon } from '../constants';
import { CodeItemActions } from './code-item-actions';
import { DirectoryActions } from './directory-actions';
import CodeId from './code-id';

import './logic-list.less';

type TreeNode = TreeProps['data'][number] & {
    value: string;
};

export const LogicList = defineComponent({
    props: {
        activeId: String,
        extendActions: {
            type: Array as PropType<string[]>,
            default: (): string[] => [],
        },
        codesInstance: {
            type: Object as PropType<Record<string, any>>,
        },
        hasCodeId: Function as PropType<(id: string) => boolean>,
        code: Object as PropType<IPublicModelCode>,
        searchText: String,
        onSelect: Function as PropType<((id?: string) => void)>,
    },
    setup(props) {
        const codeItemsEditing = reactive<Record<string, boolean>>({});
        const onRename = (id: string) => {
            codeItemsEditing[id] = true;
            props.onSelect(id);
        };
        const onDelete = (id: string | string[]) => {
            const ids = typeof id === 'string' ? [id] : id;
            if (ids.includes(props.activeId))
                props.onSelect(null);
        };

        const expandedKeys = ref<string[]>([]);
        const addExpanded = (id: string) => {
            if (!expandedKeys.value.includes(id))
                expandedKeys.value.push(id);
        };

        const onSelectCodeItemOrDirectory = (id: string) => {
            if (props.activeId === id)
                codeItemsEditing[id] = true;
            else
                props.onSelect(id);
        };

        const onTreeSelect = ({ selectedKeys }: {
            selectedKeys: string[];
        }) => {
            onSelectCodeItemOrDirectory(selectedKeys[0]);
        };

        const changeCodeId = (id: string, preId: string) => {
            const directory = props.code.getDirectory(preId);
            if (directory) {
                props.code.changeDirectoryId(id, preId);
            }
            else {
                props.code.changeCodeId(id, preId);
                if (props.codesInstance) {
                    const codesInstance = props.codesInstance as Record<string, any>;
                    Object.keys(codesInstance).forEach((currentId) => {
                        if (codesInstance[currentId].deps.includes(preId))
                            props.code.scopeVariableChange(currentId, id, preId);
                    });
                }
            }
            codeItemsEditing[id] = codeItemsEditing[preId];
            delete codeItemsEditing[preId];
        };

        const isInValidateCodeId = (id: string) => {
            return props.hasCodeId(id) || !/^[a-zA-Z_][a-zA-Z_0-9]*$/.test(id);
        };

        function genLabel(item: ICodeItemOrDirectory) {
            return () => h(CodeId, {
                'isEditing': codeItemsEditing[item.id],
                'id': item.id,
                'isInValidateCodeId': isDirectory(item) ? props.hasCodeId : isInValidateCodeId,
                'onChange': changeCodeId,
                'onUpdate:isEditing': (val: boolean) => codeItemsEditing[item.id] = val,
            });
        }

        function formatCodeItem(codeItem: ICodeItem, code: IPublicModelCode) {
            return {
                label: genLabel(codeItem),
                value: codeItem.id,
                prefix: () => codeItem.type === IEnumCodeType.JAVASCRIPT_QUERY ? h(ResourceTypeIcon[codeItem.resourceType]) : h(IconMap[codeItem.type]),
                suffix: () => h(CodeItemActions, {
                    id: codeItem.id,
                    code,
                    onRename,
                    onSelect: onSelectCodeItemOrDirectory,
                    onDelete,
                }),
            };
        }

        function formatCodeStruct(code?: IPublicModelCode) {
            const treeData: TreeNode[] = code?.directories.map((item) => {
                const codeItems = item.code.filter((codeItem) => {
                    return !isNil(props.searchText) ? codeItem.id.includes(props.searchText) : true;
                }).map((codeItem) => {
                    return formatCodeItem(codeItem, code);
                });

                // REFACTOR computed 内部不应该有副作用
                if (!isNil(props.searchText) && codeItems.length && !expandedKeys.value.includes(item.id))
                    expandedKeys.value.push(item.id);

                return {
                    label: genLabel(item),
                    value: item.id,
                    draggable: false,
                    children: codeItems,
                    prefix: () => h(FolderIcon),
                    suffix: () => h(DirectoryActions, {
                        id: item.id,
                        code,
                        onRename,
                        extendActions: props.extendActions,
                        onAdd: addExpanded,
                        onSelect: onSelectCodeItemOrDirectory,
                        onDelete,
                    }),
                };
            }) ?? [];
            return treeData.concat(code.code.filter((item) => {
                return !isNil(props.searchText) ? item.id.includes(props.searchText) : true;
            }).map((codeItem) => {
                return formatCodeItem(codeItem, code);
            }));
        }

        const treeData = computed(() => formatCodeStruct(props.code));

        const onDrop = ({ originNode, originDragNode, position }: {
            originNode: TreeNode;
            originDragNode: TreeNode;
            position: 'before' | 'inside' | 'after';
        }) => {
            if (!originNode.draggable && !expandedKeys.value.includes(originNode.value))
                expandedKeys.value.push(originNode.value);

            props.code.changePosition(originDragNode.value, originNode.value, position);
        };

        return () => {
            return (
                <div class="letgo-logic-list">
                    <FTree
                        v-model:expandedKeys={expandedKeys.value}
                        data={treeData.value}
                        cancelable={false}
                        selectedKeys={[props.activeId]}
                        draggable
                        onDrop={onDrop}
                        onSelect={onTreeSelect}
                    />
                </div>
            );
        };
    },
});
