import type {
    PropType,
    ShallowRef,
} from 'vue';
import {
    computed,
    defineComponent,
    onBeforeMount,
    onMounted,
    reactive,
    ref,
    shallowRef,
    triggerRef,
} from 'vue';
import { get, isArray, isFunction, isNil, isUndefined } from 'lodash-es';
import {
    isSetterConfig,
} from '@webank/letgo-types';
import type {
    IPublicTypeSetter,
    IPublicTypeSetterConfig,
    IPublicTypeSetterType,
} from '@webank/letgo-types';
import { createSettingFieldView, isSettingField, usePopupManage } from '@webank/letgo-designer';
import type { IFieldConfig, ISettingField, SettingField } from '@webank/letgo-designer';
import { FButton, FDraggable } from '@fesjs/fes-design';
import { AddOne, Config, DeleteOne, Drag } from '@icon-park/vue-next';
import { commonProps } from '../../common';
import './index.less';

interface ItemType { main: SettingField, cols: SettingField[] }

const ArraySetterView = defineComponent({
    name: 'ArraySetterView',
    props: {
        ...commonProps,
        value: {
            type: Array,
        },
        defaultValue: {
            type: Array,
        },
        itemSetter: {
            type: [String, Object, Array] as PropType<IPublicTypeSetterType>,
        },
        columns: {
            type: Array as PropType<IFieldConfig[]>,
        },
        defaultItemValue: {
            type: [String, Number, Boolean, Object, Array, Function] as PropType<any | ((value: unknown) => unknown)>,
            default: (): undefined => undefined,
        },
        infinite: Boolean,
    },
    setup(props) {
        const { field } = props;

        const popup = usePopupManage();

        const propsRef = computed(() => {
            if (!props.infinite)
                return props;

            const owner = field.parent?.parent;

            if (!isSettingField(owner))
                return props;

            const setter = owner?.setter;

            if (isArray(setter)) {
                const arraySetter = setter.find(item => isSetterConfig(item) && item?.componentName === 'ArraySetter');
                return ((arraySetter as IPublicTypeSetterConfig)?.props as typeof props) ?? props;
            }
            if (isSetterConfig(setter))
                return (setter.props as typeof props) ?? props;

            return props;
        });

        const itemSetterRef = computed(() => {
            return propsRef.value?.itemSetter ?? props.itemSetter;
        });

        const columnsRef = computed(() => {
            return propsRef.value?.columns ?? props.columns;
        });

        const hasCol = columnsRef.value && columnsRef.value.length;

        const items: ShallowRef<Array<ItemType>> = shallowRef([]);

        const onItemChange = (target: ISettingField) => {
            const targetPath: Array<string | number> = target?.path;
            if (!targetPath || targetPath.length < 2) {
                console.warn(
                    `[ArraySetter] onItemChange 接收的 target.path <${targetPath || 'undefined'
                    }> 格式非法需为 [propName, arrayIndex, key?]`,
                );
                return;
            }
            const { path } = field;
            if (path[0] !== targetPath[0]) {
                console.warn(
                    `[ArraySetter] field.path[0] !== target.path[0] <${path[0]} !== ${targetPath[0]}>`,
                );
                return;
            }
            const fieldValue = field.getValue();
            try {
                const index = +targetPath[targetPath.length - 2];
                if (typeof index === 'number' && !Number.isNaN(index)) {
                    fieldValue[index] = items.value[index].main.getValue();
                    field?.extraProps?.setValue?.call(field, field, fieldValue);
                }
            }
            catch (e) {
                console.warn('[ArraySetter] extraProps.setValue failed :', e);
            }
        };

        const createItem = (name: string | number): ItemType => {
            const value = isNil(props.value) ? props.defaultValue : props.value;
            const colField = field.createField({
                name,
                setter: itemSetterRef.value,
                display: 'plain',
                extraProps: {
                    setValue: onItemChange,
                },
            });
            let cols: SettingField[];
            if (hasCol) {
                cols = columnsRef.value.map((item) => {
                    const colName = `${name}.${item.name}`;
                    const itemField = field.createField({
                        ...item,
                        name: colName,
                        display: 'plain',
                        extraProps: {
                            defaultValue: get(value, colName),
                            setValue: onItemChange,
                        },
                    });
                    return itemField;
                });
            }
            return {
                main: colField,
                cols: cols ?? [],
            };
        };

        const addItem = () => {
            const item = createItem(items.value.length);
            items.value.push(item);
            triggerRef(items);
        };

        const onAdd = () => {
            const value = field.getValue() ?? [];
            if (props.defaultItemValue) {
                const defaultItemValue = isFunction(props.defaultItemValue) ? props.defaultItemValue(field) : props.defaultItemValue;
                props.onChange([...value, defaultItemValue]);
            }
            addItem();
        };

        const onRemove = (removed: ItemType, index: number) => {
            const { main } = removed;
            items.value.splice(index, 1);
            main.remove();
            const l = items.value.length;
            let i = index;
            while (i < l) {
                const item = items.value[i];
                item.main.setKey(i);
                item.cols.forEach((col, index) => {
                    col.setKey(`${i}.${columnsRef.value[index].name}`);
                });
                i++;
            }
            triggerRef(items);
        };

        const init = () => {
            const value = isNil(props.value) ? props.defaultValue : props.value;

            const valueLength = isArray(value) ? value.length : 0;

            for (let i = 0; i < valueLength; i++)
                addItem();
        };

        init();

        onMounted(() => {
            props.onMounted?.();
        });

        onBeforeMount(() => {
            items.value.forEach((field) => {
                field.main.purge();
            });
        });

        const renderTitle = () => {
            if (!columnsRef.value)
                return;

            return (
                <div class="letgo-array-setter__header">
                    {
                        columnsRef.value?.map((item) => {
                            return <span class="letgo-array-setter__title">{item.title}</span>;
                        })
                    }
                </div>
            );
        };

        const drawerShowList = reactive<Record<number, boolean>>({});

        const renderField = (item: ItemType, rowIndex: number) => {
            const { main, cols } = item;
            if (hasCol) {
                const toggle = () => {
                    drawerShowList[rowIndex] = !drawerShowList[rowIndex];
                    if (drawerShowList[rowIndex] && popup.openPopup) {
                        popup.openPopup(`${field.name}.${main.name}`, createSettingFieldView(main), () => {
                            drawerShowList[rowIndex] = !drawerShowList[rowIndex];
                        });
                    }
                };
                return (
                    <>
                        <Config onClick={() => toggle()} class="letgo-array-setter__icon" theme="outline" />
                        {
                            columnsRef.value.map((_item, index) => {
                                const itemField = cols[index];
                                if (!itemField)
                                    return null;
                                return (
                                    <div class="letgo-array-setter__item">
                                        {createSettingFieldView(itemField)}
                                    </div>
                                );
                            })
                        }
                    </>
                );
            }
            return (
                <div class="letgo-array-setter__item">
                    {createSettingFieldView(main)}
                </div>
            );
        };

        const draggable = ref(false);

        const onMousedown = () => {
            draggable.value = true;
        };

        const onDragend = () => {
            draggable.value = false;
            // 这时候items的值是正确顺序
            props.onChange(items.value.map(item => item.main.getValue()));
            let i = 0;
            const l = items.value.length;
            while (i < l) {
                const item = items.value[i];
                item.main.setKey(i);
                item.cols.forEach((col, index) => {
                    col.setKey(`${i}.${columnsRef.value[index].name}`);
                });
                i++;
            }
            triggerRef(items);
        };

        const renderBody = () => {
            return (
                <FDraggable
                    v-model={items.value}
                    disabled={!draggable.value}
                    onDragend={onDragend}
                    v-slots={{
                        default: ({ item, index }: { item: ItemType, index: number }) => {
                            return (
                                <div class={['letgo-array-setter__body', !hasCol && 'letgo-array-setter__body--big']}>
                                    <Drag class="letgo-array-setter__icon" theme="outline" onMousedown={onMousedown} />
                                    {renderField(item, index)}
                                    <DeleteOne onClick={() => onRemove(item, index)} class="letgo-array-setter__icon" theme="outline" />
                                </div>
                            );
                        },
                    }}
                >
                </FDraggable>
            );
        };

        return () => {
            return (
                <div class="letgo-array-setter">
                    {renderTitle()}
                    {renderBody()}
                    <div class={{ 'letgo-array-setter__add': hasCol }}>
                        <FButton
                            long
                            v-slots={{ icon: () => <AddOne style={{ marginRight: '8px' }} class="letgo-array-setter__icon" theme="outline"></AddOne> }}
                            onClick={onAdd}
                        >
                            新增选项
                        </FButton>
                    </div>
                </div>
            );
        };
    },
});

export const ArraySetter: IPublicTypeSetter = {
    type: 'ArraySetter',
    title: '数组设置器',
    Component: ArraySetterView,
    condition: (field) => {
        const v = field.getValue() ?? field.getDefaultValue();
        return isUndefined(v) || isArray(v);
    },
};
