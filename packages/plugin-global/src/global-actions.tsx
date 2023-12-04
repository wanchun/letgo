import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { Designer } from '@harrywan/letgo-designer';
import { iconCls } from './global-actions.css';

export default defineComponent({
    name: 'GlobalActions',
    props: {
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup() {
        return () => {
            return (
                <span class={iconCls}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 21 21">
                        <g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10 19c4.438 0 8-3.526 8-7.964C18 6.598 14.438 3 10 3c-4.438 0-8 3.598-8 8.036S5.562 19 10 19M3 8h14M3 14h14" />
                            <path d="M10 19c2.219 0 4-3.526 4-7.964C14 6.598 12.219 3 10 3c-2.219 0-4 3.598-4 8.036S7.781 19 10 19" />
                        </g>
                    </svg>
                </span>
            );
        };
    },
});
