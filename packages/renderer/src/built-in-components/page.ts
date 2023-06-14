import { defineComponent, h } from 'vue';
import type { IPublicTypeComponentMetadata } from '@webank/letgo-types';

const Page = defineComponent((props, { slots }) => {
    return () => h('div', { class: 'letgo-page', style: { height: '100%' }, ...props }, slots);
});

const componentMetadata: IPublicTypeComponentMetadata = {
    title: '页面',
    componentName: 'Page',
    configure: {
        supports: {
            style: true,
            class: true,
        },
        component: {
            isContainer: true,
            disableBehaviors: '*',
        },
    },
};

Object.assign(Page, {
    componentMetadata,
});

export default Page;
