import { defineComponent, h } from 'vue';
import type { IPublicTypeComponentMetadata } from '@webank/letgo-types';

export const Page = defineComponent((props, { slots }) => {
    return () => h('div', { class: 'letgo-page', ...props }, slots);
});

export const PageMeta: IPublicTypeComponentMetadata = {
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
