import type { PropType } from 'vue';
import { defineComponent, ref } from 'vue';
import { Caution, CloseOne, Log } from '@icon-park/vue-next';
import type { LogLevel } from '@webank/letgo-common';
import type { Project, Skeleton } from '@webank/letgo-engine-plugin';
import Tag from './components/tag';
import LogContent from './components/log-content';
import { useSharedLog } from './use';

import './pane.less';

export default defineComponent({
    props: {
        project: Object as PropType<Project>,
        skeleton: Object as PropType<Skeleton>,
    },
    setup(props) {
        const activeLogLevels = ref<LogLevel[]>(['error', 'warn']);
        const filterLog = (level: LogLevel) => {
            const index = activeLogLevels.value.findIndex(l => l === level);
            if (index === -1)
                activeLogLevels.value.push(level);
            else
                activeLogLevels.value.splice(index, 1);
        };

        const { errorCount, warnCount, infoCount, clearAllLog } = useSharedLog();

        return () => {
            return (
                <div class="letgo-plg-console">
                    <div class="letgo-plg-console__header">
                        <div class="letgo-plg-console__header-left">
                            <span style="color: #bfbfbf">过滤</span>
                            <Tag count={errorCount.value} name="error" activeTags={activeLogLevels.value} onSelect={filterLog}>
                                <CloseOne theme="filled" size={14} style="color: #f5222d;"></CloseOne>
                            </Tag>
                            <Tag count={warnCount.value} name="warn" activeTags={activeLogLevels.value} onSelect={filterLog}>
                                <Caution theme="filled" size={14} style="color: #faad14;"></Caution>
                            </Tag>
                            <Tag count={infoCount.value} name="info" activeTags={activeLogLevels.value} onSelect={filterLog}>
                                <Log theme="filled" size={14} style="color: #8c8c8c;"></Log>
                            </Tag>
                        </div>
                        <span class="letgo-plg-console__header-clear" onClick={clearAllLog}>
                            <svg viewBox="0 0 1024 1024" version="1.1" width="1em" height="1em"><path d="M916.138667 198.4 919.296 195.242667 828.757333 104.704 825.6 107.861333C738.901333 40.533333 630.272 0 512 0 229.205333 0 0 229.290667 0 512 0 630.272 40.448 738.901333 107.861333 825.6L104.704 828.757333 195.157333 919.296 198.4 916.053333C285.013333 983.466667 393.642667 1024 512 1024 794.709333 1024 1024 794.709333 1024 512 1024 393.728 983.466667 285.098667 916.138667 198.4ZM73.130667 512C73.130667 269.994667 269.994667 73.130667 512 73.130667 606.634667 73.130667 721.578667 112.725333 793.344 163.84L177.493333 779.52C126.378667 707.84 73.130667 606.634667 73.130667 512ZM512 950.869333C417.365333 950.869333 307.029333 897.536 235.178667 846.421333L855.637333 226.133333C906.666667 297.898667 950.869333 417.365333 950.869333 512 950.869333 754.005333 754.005333 950.869333 512 950.869333Z" fill="#8a8a8a" p-id="21696"></path></svg>
                        </span>
                    </div>
                    <LogContent visibleLogLevels={activeLogLevels.value} skeleton={props.skeleton} project={props.project} />
                </div>
            );
        };
    },
});
