import { defineComponent } from 'vue';
import { TOOLS } from '../constants';

import './tools-header.less';
import { useSharedTool } from '../use';

export default defineComponent({
    setup() {
        const {
            currentTool,
            changeTool,
        } = useSharedTool();

        return () => {
            return (
                <div class="letgo-devtools-headers">
                    {TOOLS.map((item) => {
                        return (
                            <span
                                class={['letgo-devtools-headers-item', currentTool.value === item.value && 'letgo-devtools-headers-item--active']}
                                onClick={() => changeTool(item.value)}
                            >
                                {item.label}
                            </span>
                        );
                    })}
                </div>
            );
        };
    },
});
