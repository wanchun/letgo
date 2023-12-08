import { defineComponent } from 'vue';
import './label.less';

export default defineComponent({
    name: 'ModifyLabel',
    props: {
        label: String,
    },
    setup(props, { slots }) {
        return () => {
            return <div class="letgo-comp-event__label">
                <label class="letgo-comp-event__label-text">{props.label}</label>
                {slots.default?.()}
            </div>;
        };
    },
});
