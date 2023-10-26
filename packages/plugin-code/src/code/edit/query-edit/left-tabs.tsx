import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { activeTabCls, leftTabsCls, tabCls } from './left-tabs.css';

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
        // {
        //     value: 'response',
        //     label: '响应',
        // },
        {
            value: 'advanced',
            label: '高级',
        }];

        const selectTab = (tab: { value: string; label: string }) => {
            props.changeTab?.(tab.value);
        };

        const renderTabs = () => {
            return tabs.map((tab) => {
                return <button class={[tabCls, props.tab === tab.value ? activeTabCls : '']} onClick={() => selectTab(tab)}>{tab.label}</button>;
            });
        };

        return () => {
            return <div class={leftTabsCls} >
                {renderTabs()}
            </div>;
        };
    },
});
