import { defineComponent } from 'vue';
import { Components } from '@icon-park/vue-next';
import { iconCls } from './content.css';

export default defineComponent({
    setup() {
        return () => {
            return <Components theme="outline" class={iconCls} />;
        };
    },
});
