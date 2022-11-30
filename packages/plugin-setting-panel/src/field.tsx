import { defineComponent, PropType } from 'vue';
import {
    SettingField,
    SettingEntry,
    isSettingField,
} from '@webank/letgo-designer';
import { CustomView } from '@webank/letgo-types';
import { filedWrapperCls } from './index.css';

const SettingGroupView = defineComponent({});

const SettingFieldView = defineComponent({});

const createSettingFieldView = (
    item: SettingField | CustomView,
    index: number,
    field: SettingEntry,
) => {
    if (isSettingField(item)) {
        if (item.isGroup) {
            return <SettingGroupView field={item} key={item.id} />;
        } else {
            return <SettingFieldView field={item} key={item.id} />;
        }
    } else {
        return item(item, { index, field });
    }
};

export default defineComponent({
    name: 'PluginSetterPanelField',
    props: {
        field: Object as PropType<SettingField>,
    },
    setup() {},
    render() {
        const { field } = this;
        const { items } = field;
        return (
            <div class={filedWrapperCls}>
                {items.map((item, index) =>
                    createSettingFieldView(item, index, field),
                )}
            </div>
        );
    },
});
