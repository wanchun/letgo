import { defineComponent } from 'vue';
import { categoryCls, titleCls } from './category.css';

export default defineComponent({
    props: {
        title: String,
    },
    setup(props, { slots }) {
        return () => {
            return <div class={categoryCls}>
                <h3 class={titleCls}>{props.title}</h3>
                {slots.default?.()}
            </div>;
        };
    },
});
