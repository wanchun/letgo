import { defineComponent } from 'vue';
import type { IPublicTypeComponentMetadata } from '@harrywan/letgo-types';

export const Leaf = defineComponent({
    name: 'Leaf',
    render() {
        return this.$slots.default?.();
    },
});

export const LeafMeta: IPublicTypeComponentMetadata = {
    title: '叶子节点',
    componentName: 'Leaf',
    configure: {
        props: [
            {
                name: 'children',
                title: '内容',
                setter: 'StringSetter',
            },
        ],
    },
};
