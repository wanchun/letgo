import { computed, defineComponent } from 'vue';
import { FBadge } from '@fesjs/fes-design';

import './console-title.less';
import { useSharedLog } from '../use';

export default defineComponent({
    setup() {
        const { errorCount } = useSharedLog();

        const hiddenErrorDot = computed(() => {
            return errorCount.value <= 0;
        });

        return () => {
            return (
                <div class="letgo-plg-console__title">
                    <FBadge
                        size="small"
                        dot
                        hidden={hiddenErrorDot.value}
                    >
                        日志
                    </FBadge>
                </div>
            );
        };
    },
});
