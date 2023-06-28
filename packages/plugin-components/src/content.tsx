import { defineComponent } from 'vue';
import { Components } from '@icon-park/vue-next';
import { FTooltip } from '@fesjs/fes-design';
import { iconCls } from './content.css';

export default defineComponent({
    setup() {
        return () => {
            return <FTooltip content="组件库" placement="right"><Components theme="outline" class={iconCls} /></FTooltip>;
        };
    },
});
