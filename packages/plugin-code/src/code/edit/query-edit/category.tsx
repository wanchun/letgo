import { defineComponent } from 'vue';
import { categoryCls, titleCls } from './category.css';

export default defineComponent({
    props: {
        title: String,
    },
    setup(props, { slots }) {
        return () => {
            return <div class={categoryCls}>
                <div class={titleCls}>{props.title}</div>
                {slots.default?.()}
            </div>;
        };
    },
});
