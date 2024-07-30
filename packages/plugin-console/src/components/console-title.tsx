import { defineComponent, ref, watch } from 'vue';
import { FBadge } from '@fesjs/fes-design';

import './console-title.less';
import { useSharedLog, useSharedPaneVisible } from '../use';

export default defineComponent({
    setup() {
        const { errorCount } = useSharedLog();
        const { paneVisible } = useSharedPaneVisible();

        const visibleErrorDot = ref(false);

        watch(paneVisible, (val) => {
            if (val)
                visibleErrorDot.value = false;
        });

        watch(errorCount, (val) => {
            visibleErrorDot.value = !paneVisible.value && val > 0;
        });

        return () => {
            return (
                <div class="letgo-plg-console__title">
                    <FBadge
                        size="small"
                        dot
                        hidden={!visibleErrorDot.value}
                    >
                        Console
                    </FBadge>
                </div>
            );
        };
    },
});
