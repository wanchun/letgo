import { defineComponent, PropType } from 'vue';
import { Area } from '../area';
import { IModalConfig } from '../types';
import { Modal } from '../widget';

export default defineComponent({
    name: 'GlobalArea',
    props: {
        area: {
            type: Object as PropType<Area<IModalConfig, Modal>>,
        },
    },
    setup(props) {
        return () => {
            const { area } = props;
            return <div>{area.items.value.map((item) => item.content)}</div>;
        };
    },
});
