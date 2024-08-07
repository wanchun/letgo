import type { CSSProperties, ComputedRef } from 'vue';
import { computed, defineComponent, ref } from 'vue';
import { isNil } from 'lodash-es';
import type { IPublicTypeComponentMetadata } from '@webank/letgo-types';
import { version } from '../version';

export const Icon = defineComponent({
    name: 'Icon',
    props: {
        content: String,
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
        const isReady = ref(false);
        setTimeout(() => {
            isReady.value = true;
        });

        return () => {
            if (!isReady.value)
                return null;
            return (
                <span style={svgStyle.value} v-html={props.content}>
                </span>
            );
        };
    },
});

export const IconMeta: IPublicTypeComponentMetadata = {
    title: '图标',
    componentName: 'Icon',
    npm: {
        package: '@webank/letgo-components',
        version,
        exportName: 'Icon',
        destructuring: true,
    },
    configure: {
        props: [
            {
                name: 'content',
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
            events: ['onClick'],
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
