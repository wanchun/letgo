import { defineComponent } from 'vue';
import { PlusOutlined } from '@fesjs/fes-design/icon';
import { eventHandlersCls, eventListTitle, titleCls } from './event-handlers.css';

export default defineComponent({
    setup() {
        return () => {
            return <div class={eventHandlersCls}>
                <h5 class={titleCls}>事件绑定</h5>
                <div>
                    <div class={eventListTitle}>
                        <span>Success</span>
                        <PlusOutlined />
                    </div>
                </div>
            </div>;
        };
    },
});
