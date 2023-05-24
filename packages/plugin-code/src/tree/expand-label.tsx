import { defineComponent } from 'vue';
import FillArrow from './fill-arrow';
import LabelTip from './label-tip';
import { expandIconCls } from './expand-label.css';

export default defineComponent({
    props: {
        label: [String, Number],
        value: [Object, Array],
    },
    setup(props) {
        return () => {
            return <span>
            <FillArrow class={expandIconCls} />
            <span style="font-weight: 600">{props.label}</span>
            <LabelTip value={props.value} />
        </span>;
        };
    },
});
