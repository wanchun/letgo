import {
    defineComponent,
    PropType,
    onBeforeMount,
    ref,
    shallowReactive,
    ShallowReactive,
} from 'vue';
import { engineConfig } from '@webank/letgo-editor-core';
import { DesignerView, Designer } from '@webank/letgo-designer';
import css from './index.module.css';
import type { IPluginContext } from '@webank/letgo-engine';

export default defineComponent({
    name: 'PluginSetter',
    props: {
        ctx: {
            type: Object as PropType<IPluginContext>,
        },
    },
    setup(props) {
        return () => {
            return null;
        };
    },
});
