import { defineComponent, PropType, CSSProperties } from 'vue';
import { NCollapseItem, NButtonGroup, NButton } from 'naive-ui';
import Row from '../components/row';

export default defineComponent({
    props: {
        data: {
            type: Object as PropType<CSSProperties>,
        },
        onStyleChange: Function as PropType<(style: CSSProperties) => void>,
    },
    setup() {
        return () => {
            return (
                <NCollapseItem name="layout" title="布局">
                    <Row label="布局模式">
                        <NButtonGroup size="small">
                            <NButton ghost>inline</NButton>
                            <NButton ghost>inline-flex</NButton>
                            <NButton ghost>block</NButton>
                            <NButton ghost>flex</NButton>
                            <NButton ghost>none</NButton>
                        </NButtonGroup>
                    </Row>
                </NCollapseItem>
            );
        };
    },
});
