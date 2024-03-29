import type { IPublicTypeComponentMetadata } from '@webank/letgo-types';
import { defineComponent } from 'vue';

export const Slot = defineComponent({
    props: {
        params: {
            type: Object,
            default: () => ({}),
        },
    },
    render() {
        return this.$slots?.default(this.params);
    },
});

export const SlotMeta: IPublicTypeComponentMetadata = {
    title: '插槽',
    componentName: 'Slot',
    configure: {
        props: [
            {
                name: 'params',
                title: '插槽入参（不可变更）',
                setter: {
                    componentName: 'ArraySetter',
                    props: {
                        itemSetter: {
                            componentName: 'StringSetter',
                            props: {
                                placeholder: '参数名称',
                            },
                        },
                    },
                },
            },
        ],
        component: {
            isContainer: true,
            disableBehaviors: '*',
        },
    },
};
