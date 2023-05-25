import type { PropType, ShallowRef } from 'vue';
import { defineComponent, onBeforeUnmount, shallowRef } from 'vue';
import { Computer, Phone } from '@icon-park/vue-next';
import type { Designer, Simulator } from '@webank/letgo-designer';
import type { IPublicTypeDevice } from '@webank/letgo-types';
import { iconCls, isActiveCls, wrapperCls } from './device.css';

export const DeviceView = defineComponent({
    name: 'DeviceView',
    props: {
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup(props) {
        const { designer } = props;

        const simulatorRef: ShallowRef<Simulator> = shallowRef();

        const off = designer.onSimulatorReady((sim) => {
            simulatorRef.value = sim as Simulator;
        });

        onBeforeUnmount(() => {
            simulatorRef.value = null;
            off?.();
        });

        const isActive = (device: IPublicTypeDevice) => {
            return simulatorRef.value?.device === device;
        };

        const onChange = (device: IPublicTypeDevice) => {
            simulatorRef.value.set('device', device);
        };

        return () => {
            return (
                <div class={wrapperCls}>
                    <span class={[iconCls, isActive('default') && isActiveCls]} onClick={() => onChange('default')}>
                        <Computer theme="outline" strokeWidth={3} />
                    </span>
                    <span class={[iconCls, isActive('mobile') && isActiveCls]} onClick={() => onChange('mobile')}>
                        <Phone theme="outline" strokeWidth={3} />
                    </span>
                </div>
            );
        };
    },
});
