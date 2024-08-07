import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import { Caution, CloseOne, Log } from '@icon-park/vue-next';
import type { Project, Skeleton } from '@webank/letgo-engine-plugin';
import { LogIdType } from '@webank/letgo-common';
import type { FormattedLog } from '../log-formatter';

import './log-item.less';

export default defineComponent({
    props: {
        log: Object as PropType<FormattedLog>,
        project: Object as PropType<Project>,
        skeleton: Object as PropType<Skeleton>,
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

        const selectComponent = () => {
            if (props.log.idType === LogIdType.COMPONENT) {
                const doc = props.project.currentDocument;
                const node = doc.findNode(node => node.id === props.log.id);
                if (node)
                    node.select();
            }
            else if (props.log.idType === LogIdType.CODE) {
                const currentItem = props.skeleton.leftFloatArea.items.find(item => item.name === 'CodePanel');
                if (currentItem)
                    currentItem.show();
            }
        };

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
                        <div class="letgo-plg-console__log-id" onClick={selectComponent}>
                            {props.log.id}
                        </div>
                    )}
                </div>
            );
        };
    },
});
