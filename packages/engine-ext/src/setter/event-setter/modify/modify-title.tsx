import { defineComponent } from 'vue';
import { CloseOutlined } from '@fesjs/fes-design/icon';
import { iconCls, titleWrapCls } from './modify-title.css';

export default defineComponent({
    props: {
        title: String,
        onClose: Function,
    },
    setup(props) {
        return () => {
            return <div class={titleWrapCls}>
                {props.title}
                <CloseOutlined onClick={props.onClose} class={iconCls} />
            </div>;
        };
    },
});
