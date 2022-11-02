import simulator from './simulator';

const win = window as any;

if (typeof win !== 'undefined') {
    win.SimulatorRenderer = simulator;
}

win.addEventListener('beforeunload', () => {
    win.LETGO_Simulator = null;
    win.SimulatorRenderer = null;
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
