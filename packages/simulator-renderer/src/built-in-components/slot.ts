import { defineComponent, h } from 'vue';
import type { IPublicTypeComponentMetadata } from '@webank/letgo-types';

const Slot = defineComponent({
    render() {
        return h('div', { class: 'letgo-container' }, this.$slots);
    },
});

const componentMetadata: IPublicTypeComponentMetadata = {
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

Object.assign(Slot, {
    componentMetadata,
});

export default Slot;
