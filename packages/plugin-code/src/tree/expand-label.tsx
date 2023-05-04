import { defineComponent } from 'vue';
import FillArrow from '../fill-arrow';
import LabelTip from './label-tip';

export default defineComponent({
    props: {
        label: [String, Number],
        value: [Object, Array],
    },
    setup(props) {
        return () => {
            return <span>
            <FillArrow style={'color: #bfbfbf'} />
            <span style="font-weight: 600">{props.label}</span>
            <LabelTip value={props.value} />
        </span>;
        };
    },
});
