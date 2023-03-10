import simulator from './simulator';
import { warn } from './utils';

const win = window as any;

if (typeof win !== 'undefined') {
    win.LETGO_SimulatorRenderer = simulator;
}

win.addEventListener('load', () => {
    if (!win.__VUE_HMR_RUNTIME__) {
        warn('检测到您正在使用 vue 运行时的生产环境版本');
        warn('这将导致画布的部分功能异常，请使用非生产环境版本代替');
        warn('https://unpkg.com/vue/dist/vue.runtime.global.js');
    }
});

win.addEventListener('beforeunload', () => {
    win.LETGO_Simulator = null;
    win.LETGO_SimulatorRenderer = null;
    simulator.dispose();
});

export default simulator;
export * from '@webank/letgo-renderer';
export {
    useLeaf,
    useRenderer,
    useRootScope,
    useRendererContext,
    config as vueRendererConfig,
    default as VueRenderer,
} from '@webank/letgo-renderer';
export * from './interface';
