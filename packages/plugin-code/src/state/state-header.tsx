import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { DownOutlined } from '@fesjs/fes-design/icon';
import { categoryTitleCls, titleIconCls } from './state-header.css';

export default defineComponent({
    props: {
        title: String,
        clickHeader: Function as PropType<(event: MouseEvent) => void>,
        isActive: Boolean,
    },
    setup(props) {
        return () => {
            return <div class={categoryTitleCls} onClick={props.clickHeader}>
                {props.title}
                <span class={titleIconCls}>
                    <DownOutlined style={{ transition: 'all 0.3s', transform: props.isActive ? 'rotate(0)' : 'rotate(180deg)' }} />
                </span>
            </div>;
        };
    },
});
