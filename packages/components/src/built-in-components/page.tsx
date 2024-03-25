import { defineComponent, h } from 'vue';
import type { IPublicTypeComponentMetadata } from '@webank/letgo-types';

export const Page = defineComponent({
    props: {
        margin: {
            type: String,
            default: '0',
        },
        padding: {
            type: String,
            default: '0',
        },
        background: {
            type: String,
        },
    },
    setup(props, { slots }) {
        return () => {
            return (
                <div class="letgo-page" style={{ height: '100%', ...props }}>
                    { slots?.default() }
                </div>
            );
        };
    },
});

export const PageMeta: IPublicTypeComponentMetadata = {
    title: '页面',
    componentName: 'Page',
    configure: {
        props: [
            {
                name: 'margin',
                title: '外间距',
                setter: {
                    componentName: 'RadioGroupSetter',
                    props: {
                        options: [
                            {
                                label: '无间距',
                                value: '0',
                            },
                            {
                                label: '20px',
                                value: '20px',
                            },
                        ],
                    },
                },
                defaultValue: '0',
                supportVariable: false,
            },
            {
                name: 'padding',
                title: '内间距',
                setter: {
                    componentName: 'RadioGroupSetter',
                    props: {
                        options: [
                            {
                                label: '无间距',
                                value: '0',
                            },
                            {
                                label: '20px',
                                value: '20px',
                            },
                            {
                                label: '12px',
                                value: '12px',
                            },
                        ],
                    },
                },
                defaultValue: '0',
                supportVariable: false,
            },
            {
                name: 'background',
                title: '背景色',
                setter: {
                    componentName: 'RadioGroupSetter',
                    props: {
                        options: [
                            {
                                label: '白色',
                                value: '#fff',
                            },
                            {
                                label: '透明',
                                value: undefined,
                            },
                        ],
                    },
                },
                supportVariable: false,
            },
        ],
        supports: {
            style: true,
        },
        component: {
            isContainer: true,
            disableBehaviors: '*',
        },
    },
};
