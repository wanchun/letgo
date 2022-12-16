import {
    defineComponent,
    onBeforeMount,
    onMounted,
    PropType,
    ShallowRef,
    shallowRef,
} from 'vue';
import { isArray } from 'lodash-es';
import { Setter, SetterType, SettingTarget } from '@webank/letgo-types';
import { SettingField, createSettingFieldView } from '@webank/letgo-designer';
import { NCard } from 'naive-ui';
import { FButton } from '@fesjs/fes-design';
import { PlusOutlined } from '@fesjs/fes-design/icon';
import { commonProps } from '../../common/setter-props';
import { wrapperCls } from './index.css';

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
            type: [String, Object, Array] as PropType<SetterType>,
        },
    },
    setup(props) {
        const { field } = props;

        const items: ShallowRef<SettingField[]> = shallowRef([]);

        const onItemChange = (target: SettingTarget) => {
            const targetPath: Array<string | number> = target?.path;
            if (!targetPath || targetPath.length < 2) {
                console.warn(
                    `[ArraySetter] onItemChange 接收的 target.path <${
                        targetPath || 'undefined'
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
            } catch (e) {
                console.warn('[ArraySetter] extraProps.setValue failed :', e);
            }
        };

        // const onSort = () => {};

        // const onAdd = () => {};

        // const onRemove = () => {};

        const init = () => {
            const _items: SettingField[] = [];

            const valueLength =
                props.value && isArray(props.value) ? props.value.length : 0;

            for (let i = 0; i < valueLength; i++) {
                const item = field.createField({
                    name: i,
                    setter: props.itemSetter,
                    forceInline: 1,
                    extraProps: {
                        defaultValue: props.value[i],
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

        return () => {
            return (
                <div class={wrapperCls}>
                    {items.value.map((item) => {
                        return (
                            <NCard embedded={true} bordered={false}>
                                {createSettingFieldView(item)}
                            </NCard>
                        );
                    })}
                    <FButton
                        long
                        v-slots={{ icon: () => <PlusOutlined></PlusOutlined> }}
                    >
                        新增选项
                    </FButton>
                </div>
            );
        };
    },
});

export const ArraySetter: Setter = {
    type: 'ArraySetter',
    title: '数组设置器',
    Component: ArraySetterView,
    condition: (field) => {
        const v = field.getValue();
        return isArray(v);
    },
};
