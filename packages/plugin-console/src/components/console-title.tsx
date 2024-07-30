import { defineComponent } from 'vue';
import { FBadge } from '@fesjs/fes-design';

import './console-title.less';
import { useSharedLog } from '../use';

export default defineComponent({
    setup() {
        const { errorCount } = useSharedLog();
        return () => {
            return (
                <div class="letgo-plg-console__title">
                    <FBadge
                        size="small"
                        dot
                        hidden={errorCount.value === 0}
                        value={errorCount.value}
                    >
                        Console
                    </FBadge>
                </div>
            );
        };
    },
});
