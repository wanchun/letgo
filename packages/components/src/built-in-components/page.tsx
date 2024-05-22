import { defineComponent } from 'vue';
import { getConvertedExtraKey } from '@webank/letgo-common';
import type { IPublicTypeComponentMetadata } from '@webank/letgo-types';

export const Page = defineComponent({
    setup(props, { slots }) {
        return () => {
            return (
                <div class="letgo-page">
                    { slots?.default?.() }
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
                title: '样式',
                display: 'block',
                type: 'group',
                items: [
                    {
                        name: 'style.margin',
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
                        name: 'style.padding',
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
                        name: 'style.background',
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
            },
            {
                title: '其他',
                display: 'block',
                type: 'group',
                items: [
                    {
                        name: getConvertedExtraKey('fileName'),
                        title: '页面路径',
                        setter: 'StringSetter',
                    },
                    {
                        name: getConvertedExtraKey('title'),
                        title: '页面中文名',
                        setter: 'StringSetter',
                    },
                ],
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
