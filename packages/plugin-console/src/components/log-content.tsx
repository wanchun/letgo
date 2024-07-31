import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import { FVirtualList } from '@fesjs/fes-design';
import type { LogLevel } from '@webank/letgo-common';
import { useSharedLog } from '../use';
import type { FormattedLog } from '../log-formatter';
import LogItem from './log-item';

import './log-content.less';

export default defineComponent({
    props: {
        visibleLogLevels: Array as PropType<LogLevel[]>,
    },
    setup(props) {
        const { logList } = useSharedLog();

        const visibleLogList = computed(() => {
            return logList.filter((item) => {
                return props.visibleLogLevels.includes(item.level);
            });
        });

        return () => {
            return (
                <FVirtualList
                    class="letgo-plg-console__content"
                    dataKey={data => data.id}
                    dataSources={visibleLogList.value}
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
