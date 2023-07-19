import { defineComponent, h } from 'vue';
import type { IPublicTypeComponentMetadata } from '@harrywan/letgo-types';

export const Slot = defineComponent({
    render() {
        return h('div', { class: 'letgo-container' }, this.$slots);
    },
});

export const SlotMeta: IPublicTypeComponentMetadata = {
    title: '插槽',
    componentName: 'Slot',
    configure: {
        props: [
            {
                name: 'params',
                title: '插槽入参',
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