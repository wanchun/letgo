import type { PropType } from 'vue';
import {
    defineComponent,
    reactive,
} from 'vue';

import { DownOutlined } from '@fesjs/fes-design/icon';

import type { Designer } from '@webank/letgo-designer';
import FadeInExpandTransition from '../fade-in-expand-transition';
import Tree from '../tree/tree';

import { categoryCls, categoryTitleCls, stateWrapCls, titleIconCls } from './state.css';

export default defineComponent({
    props: {
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup(props) {
        const activeItem = reactive<Record<string, boolean>>({
            code: true,
            components: true,
            global: true,
        });
        const toggleExpend = (item: string) => {
            activeItem[item] = !activeItem[item];
        };
        const toggleGlobalStateExpend = () => {
            toggleExpend('global');
        };
        return () => {
            return (
                <div class={stateWrapCls}>
                    <div class={categoryCls}>
                        <div class={categoryTitleCls} onClick={toggleGlobalStateExpend}>
                            Code
                            <span class={titleIconCls}>
                                <DownOutlined style={{ transition: 'all 0.3s', transform: activeItem.global ? 'rotate(0)' : 'rotate(180deg)' }} />
                            </span>
                        </div>
                        <FadeInExpandTransition>
                            <div v-show={activeItem.global}>
                                hello world
                                <Tree value={{ a: 1 }} />
                            </div>
                        </FadeInExpandTransition>
                    </div>
                </div>
            );
        };
    },
});
