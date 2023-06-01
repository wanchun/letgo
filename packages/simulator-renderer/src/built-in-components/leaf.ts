import { defineComponent } from 'vue';
import type { IPublicTypeComponentMetadata } from '@webank/letgo-types';

const Leaf = defineComponent({
    name: 'Leaf',
    render() {
        return this.$slots.default?.();
    },
});

const componentMetadata: IPublicTypeComponentMetadata = {
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

Object.assign(Leaf, {
    componentMetadata,
});

export default Leaf;
