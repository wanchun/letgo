import type {
    PropType,
    ShallowRef,
} from 'vue';
import {
    defineComponent,
    onBeforeMount,
    onMounted,
    reactive,
    shallowRef,
    triggerRef,
} from 'vue';
import { get, isArray, isNil, isUndefined } from 'lodash-es';
import type {
    IPublicTypeFieldConfig, IPublicTypeSetter,
    IPublicTypeSetterType, IPublicTypeSettingTarget,
} from '@webank/letgo-types';
import { createSettingFieldView } from '@webank/letgo-designer';
import type { SettingField } from '@webank/letgo-designer';
import { FButton, FDrawer } from '@fesjs/fes-design';
import { AddOne, Config, DeleteOne } from '@icon-park/vue-next';
import { commonProps } from '../../common';
import {
    addWrapperCls, bodyCls, bodyWrapperCls, iconCls,
    popupContentCls, titleCls, titleWrapperCls, wrapperCls,
} from './index.css';

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
            type: Array as PropType<IPublicTypeFieldConfig[]>,
        },
    },
    setup(props) {
        const { field } = props;

        const items: ShallowRef<SettingField[]> = shallowRef([]);

        const onItemChange = (target: IPublicTypeSettingTarget) => {
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
                if (typeof index === 'number' && !isNaN(index)) {
                    fieldValue[index] = items.value[index].getValue();
                    field?.extraProps?.setValue?.call(field, field, fieldValue);
                }
            }
            catch (e) {
                console.warn('[ArraySetter] extraProps.setValue failed :', e);
            }
        };

        // const onSort = () => {};

        // TODO: 处理defaultValue
        const onAdd = () => {
            const { itemSetter, field } = props;
            const item = field.createField({
                name: items.value.length,
                setter: itemSetter,
                forceInline: 1,
                extraProps: {
                    setValue: onItemChange,
                },
            });
            items.value.push(item);
            triggerRef(items);
        };

        const onRemove = (removed: SettingField, index: number) => {
            const { field } = props;
            const values = field.getValue() || [];
            values.splice(index, 1);
            items.value.splice(index, 1);
            const l = items.value.length;
            let i = index;
            while (i < l) {
                items.value[i].setKey(i);
                i++;
            }
            removed.remove();
            const pureValues = values.map((item: any) =>
                typeof item === 'object' ? Object.assign({}, item) : item,
            );
            field?.setValue(pureValues);
            triggerRef(items);
        };

        const init = () => {
            const _items: SettingField[] = [];

            const value = isNil(props.value) ? props.defaultValue : props.value;

            const valueLength = isArray(value) ? value.length : 0;

            for (let i = 0; i < valueLength; i++) {
                const item = field.createField({
                    name: i,
                    setter: props.itemSetter,
                    forceInline: 1,
                    extraProps: {
                        defaultValue: value[i],
                        setValue: onItemChange,
                    },
                });
                _items.push(item);
            }

            return _items;
        };

        items.value = init();

        onMounted(() => {
            props.onMounted?.();
        });

        onBeforeMount(() => {
            items.value.forEach((field) => {
                field.purge();
            });
        });

        const renderTitle = () => {
            if (!props.columns)
                return;

            return (
                <div class={titleWrapperCls}>
                    {
                        props.columns?.map((item) => {
                            return <span class={titleCls}>{item.title}</span>;
                        })
                    }
                </div>
            );
        };

        const drawerShowList = reactive<Record<number, boolean>>({});

        const renderField = (item: SettingField, rowIndex: number) => {
            const value = isNil(props.value) ? props.defaultValue : props.value;
            if (props.columns) {
                const toggle = () => {
                    drawerShowList[rowIndex] = !drawerShowList[rowIndex];
                };
                return (
                    <>
                        <Config onClick={toggle} class={iconCls} theme="outline" strokeWidth={2} />
                        {
                            props.columns.map((item) => {
                                const name = `${rowIndex}.${item.name}`;
                                const itemField = field.createField({
                                    ...item,
                                    name,
                                    forceInline: 1,
                                    extraProps: {
                                        defaultValue: get(value, name),
                                        setValue: onItemChange,
                                    },
                                });
                                return (
                                    <div class={bodyCls}>
                                        {createSettingFieldView(itemField)}
                                    </div>
                                );
                            })
                        }
                        <FDrawer
                            show={drawerShowList[rowIndex]}
                            title={`${item.name}`}
                            displayDirective="if"
                            mask={false}
                            width={400}
                            contentClass={popupContentCls}
                            onCancel={toggle}
                        >
                            {createSettingFieldView(item)}
                        </FDrawer>
                    </>
                );
            }
            return (
                <div class={bodyCls}>
                    {createSettingFieldView(item)}
                </div>
            );
        };

        const renderBody = () => {
            return items.value.map((item, index) => {
                return (
                    <div class={bodyWrapperCls}>
                        {renderField(item, index)}
                        <DeleteOne onClick={() => onRemove(item, index)} class={iconCls} theme="outline" strokeWidth={2} />
                    </div>
                );
            });
        };

        return () => {
            return (
                <div class={wrapperCls}>
                    {renderTitle()}
                    {renderBody()}
                    <div class={[props.columns && addWrapperCls] }>
                        <FButton
                            long
                            v-slots={{ icon: () => <AddOne style={{ marginRight: '8px' }} class={iconCls} theme="outline" strokeWidth={2}></AddOne> }}
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
        const v = field.getValue() ?? (field as SettingField).getDefaultValue();
        return isUndefined(v) || isArray(v);
    },
};
