import { defineComponent } from 'vue';
import './category.less';

export default defineComponent({
    props: {
        title: String,
    },
    setup(props, { slots }) {
        return () => {
            return <div class="letgo-plg-code__query-category">
                <div class="letgo-plg-code__query-category-title">{props.title}</div>
                {slots.default?.()}
            </div>;
        };
    },
});
