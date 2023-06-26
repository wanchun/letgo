import type { PropType } from 'vue';
import { defineComponent, onUnmounted } from 'vue';
import type { VueSimulatorRenderer } from '../interface';
import { host } from '../host';
import SimulatorView from './simulator-view';

function useCssHandler() {
    const css = host.project.get('css') || '';
    const styleDom = document.createElement('style');
    document.getElementsByTagName('head')[0].appendChild(styleDom);
    styleDom.innerText = css.replace(/\n/g, '');

    const offEvent = host.project.onCssChange(() => {
        styleDom.innerText = host.project.get('css')?.replace(/\n/g, '');
    });

    onUnmounted(offEvent);
}

export default defineComponent({
    name: 'SimulatorApp',
    props: {
        simulator: {
            type: Object as PropType<VueSimulatorRenderer>,
            required: true,
        },
    },
    setup(props) {
        useCssHandler();

        return () => {
            return <SimulatorView simulator={props.simulator} />;
        };
    },
});
