import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import './icon.less';

export default defineComponent({
    props: {
        onClick: Function as PropType<(event: MouseEvent) => void>,
    },
    setup(props) {
        return () => {
            return (
                <span onClick={props.onClick}>
                    <svg class="letgo-comp-icon__svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="130919" width="32" height="32"><path d="M128 744.96v129.706667c0 11.946667 9.386667 21.333333 21.333333 21.333333h129.706667c5.546667 0 11.093333-2.133333 14.933333-6.4L759.893333 424.106667l-160-160L134.4 729.6c-4.266667 4.266667-6.4 9.386667-6.4 15.36zM883.626667 300.373333a42.496 42.496 0 0 0 0-60.16l-99.84-99.84a42.496 42.496 0 0 0-60.16 0l-78.08 78.08 160 160 78.08-78.08z" p-id="130920"></path></svg>
                </span>
            );
        };
    },
});
