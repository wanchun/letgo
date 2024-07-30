import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import { Caution, CloseOne, Log } from '@icon-park/vue-next';
import { LogIdType } from '@webank/letgo-common';
import type { FormattedLog } from '../log-formatter';

import './log-item.less';

export default defineComponent({
    props: {
        log: Object as PropType<FormattedLog>,
    },
    setup(props) {
        const renderIcon = () => {
            if (props.log.level === 'error')
                return <CloseOne theme="filled" size={14} style="color: #f5222d;"></CloseOne>;

            if (props.log.level === 'warn')
                return <Caution theme="filled" size={14} style="color: #faad14;"></Caution>;

            if (props.log.level === 'info')
                return <Log theme="filled" size={14} style="color: #8c8c8c;"></Log>;

            return null;
        };

        const visibleId = computed(() => {
            return [LogIdType.CODE, LogIdType.COMPONENT].includes(props.log.idType);
        });

        return () => {
            return (
                <div class={['letgo-plg-console__log', `letgo-plg-console__log--${props.log.level}`]}>
                    <div class="letgo-plg-console__log-text">
                        {renderIcon()}
                        <span>
                            {props.log.formattedMsg}
                        </span>
                    </div>
                    {visibleId.value && (
                        <div class="letgo-plg-console__log-id">
                            {props.log.id}
                        </div>
                    )}
                </div>
            );
        };
    },
});
