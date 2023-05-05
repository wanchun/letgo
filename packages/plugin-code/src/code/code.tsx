import { defineComponent } from 'vue';
import { PlusOutlined } from '@fesjs/fes-design/icon';
import { codeHeaderCls, headerIconCls } from './code.css';

export default defineComponent({
    setup() {
        return () => {
            return <div>
                <div class={codeHeaderCls}>
                    <PlusOutlined class={headerIconCls} />
                </div>
            </div>;
        };
    },
});
