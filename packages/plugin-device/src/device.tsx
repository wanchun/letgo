import type { PropType, ShallowRef } from 'vue';
import { defineComponent, onBeforeUnmount, shallowRef } from 'vue';
import { Computer, Phone } from '@icon-park/vue-next';
import type { Designer, Simulator } from '@harrywan/letgo-designer';
import type { IPublicTypeDevice } from '@harrywan/letgo-types';
import './device.less';

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
                <div class="letgo-plg-device">
                    <span class={['letgo-plg-device__icon', isActive('default') && 'letgo-plg-device__icon--active']} onClick={() => onChange('default')}>
                        <Computer theme="outline" strokeWidth={3} />
                    </span>
                    <span class={['letgo-plg-device__icon', isActive('mobile') && 'letgo-plg-device__icon--active']} onClick={() => onChange('mobile')}>
                        <Phone theme="outline" strokeWidth={3} />
                    </span>
                </div>
            );
        };
    },
});
