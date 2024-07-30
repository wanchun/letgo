import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { FVirtualList } from '@fesjs/fes-design';
import type { LogLevel } from '@webank/letgo-common';
import { useSharedLog } from '../use';
import type { FormattedLog } from '../log-formatter';
import LogItem from './log-item';

import './log-content.less';

// TODO 日志过滤
export default defineComponent({
    props: {
        visibleLogLevels: Array as PropType<LogLevel[]>,
    },
    setup() {
        const { logList } = useSharedLog();

        return () => {
            return (
                <FVirtualList
                    class="letgo-plg-console__content"
                    dataKey={data => data.id}
                    dataSources={logList}
                    v-slots={{
                        default({ source }: { source: FormattedLog }) {
                            return <LogItem log={source} />;
                        },
                    }}
                >
                </FVirtualList>
            );
        };
    },
});
