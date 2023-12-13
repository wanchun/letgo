import type { CSSProperties, ComputedRef } from 'vue';
import { computed, defineComponent, h } from 'vue';
import { isNil } from 'lodash-es';
import type { IPublicTypeComponentMetadata } from '@webank/letgo-types';

export const Icon = defineComponent({
    name: 'Icon',
    props: {
        type: String,
        rotate: String,
        size: Number,
        color: String,
    },
    setup(props) {
        const svgStyle: ComputedRef<CSSProperties[]> = computed(() => {
            return [
                {
                    display: 'inline-block',
                    textAlign: 'center',
                    lineHeight: 0,
                },
                props.rotate && {
                    transform: `rotate(${props.rotate}deg)`,
                },
                !isNil(props.size) && {
                    fontSize: `${props.size}px`,
                },
                props.color && {
                    color: props.color,
                },
            ];
        });

        return {
            svgStyle,
        };
    },
    render() {
        return h(
            'span',
            { style: this.svgStyle },
            h(
                'svg',
                {
                    style: {
                        width: '1em',
                        height: '1em',
                    },
                },
                h('use', { href: `#${this.$props.type}` }),
            ),
        );
    },
});

export const IconMeta: IPublicTypeComponentMetadata = {
    title: '图标',
    componentName: 'Icon',
    configure: {
        props: [
            {
                name: 'type',
                title: '图标',
                setter: 'IconSetter',
            },
            {
                name: 'size',
                title: '大小',
                setter: 'NumberSetter',
            },
            {
                name: 'color',
                title: '颜色',
                setter: 'ColorSetter',
            },
            {
                name: 'rotate',
                title: '旋转',
                setter: 'NumberSetter',
            },
        ],
        supports: {
            style: true,
        },
    },
    snippets: [
        {
            title: '图标',
            schema: {
                componentName: 'Icon',
                props: {
                },
            },
        },
    ],
    group: '原子组件',
    category: '基础元素',
    priority: 0,
};
