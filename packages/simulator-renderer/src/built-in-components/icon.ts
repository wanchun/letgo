import type { CSSProperties, ComputedRef } from 'vue';
import { computed, defineComponent, h } from 'vue';
import { isNil } from 'lodash-es';

const Icon = defineComponent({
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
                'svg', {
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

Object.assign(Icon, {
    displayName: 'Icon',
    componentMetadata: {
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
            supports: false,
        },
    },
});

export default Icon;
