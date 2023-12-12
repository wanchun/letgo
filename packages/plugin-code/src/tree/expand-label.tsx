import { defineComponent } from 'vue';
import FillArrow from './fill-arrow';
import LabelTip from './label-tip';
import './expand-label.less';

export default defineComponent({
    name: 'ExpandLabel',
    props: {
        label: [String, Number],
        value: [Object, Array],
    },
    setup(props) {
        return () => {
            return <span>
            <FillArrow class="letgo-plg-code-tree__expand-icon" />
            <span style="font-weight: 600">{props.label}</span>
            <LabelTip value={props.value} />
        </span>;
        };
    },
});
