import { defineComponent } from 'vue';
import { AppstoreOutlined } from '@fesjs/fes-design/icon';
import css from './content.module.css';

export default defineComponent({
    components: {
        AppstoreOutlined,
    },
    setup() {
        return () => {
            return <AppstoreOutlined class={css.icon} />;
        };
    },
});
