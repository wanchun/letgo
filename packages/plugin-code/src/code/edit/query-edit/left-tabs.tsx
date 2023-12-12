import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import './left-tabs.less';

export default defineComponent({
    name: 'LeftTabs',
    props: {
        tab: String,
        changeTab: Function as PropType<(type: string) => void>,
    },
    setup(props) {
        const tabs = [{
            value: 'general',
            label: '通用',
        },
        {
            value: 'advanced',
            label: '高级',
        }];

        const selectTab = (tab: { value: string; label: string }) => {
            props.changeTab?.(tab.value);
        };

        const renderTabs = () => {
            return tabs.map((tab) => {
                return <button class={["letgo-plg-code__query-tab", props.tab === tab.value ? 'letgo-plg-code__query-tab--active' : '']} onClick={() => selectTab(tab)}>{tab.label}</button>;
            });
        };

        return () => {
            return <div class="letgo-plg-code__query-tabs" >
                {renderTabs()}
            </div>;
        };
    },
});
