import { defineComponent } from 'vue';
import { AppstoreOutlined } from '@fesjs/fes-design/icon';
import { iconCls } from './content.css';

export default defineComponent({
    components: {
        AppstoreOutlined,
    },
    setup() {
        return () => {
            return <AppstoreOutlined class={iconCls} />;
        };
    },
});
