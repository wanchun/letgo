import type {
    PropType,
} from 'vue';
import {
    defineComponent,
} from 'vue';
import {
    FTabPane,
    FTabs,
} from '@fesjs/fes-design';
import type { Designer } from '@harrywan/letgo-designer';
import { GlobalCSS } from './global-css';
import { GlobalCode } from './global-code/code';
import { panelCls, tabsCls } from './panel.css';

export default defineComponent({
    props: {
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup(props) {
        return () => {
            return (
                <div class={panelCls}>
                    <FTabs class={tabsCls}>
                        <FTabPane
                            name="全局样式"
                            value="code"
                            displayDirective="show"
                        >
                            <GlobalCSS project={props.designer.project} />
                        </FTabPane>
                        <FTabPane
                            name="全局变量"
                            value="state"
                            displayDirective="show"
                        >
                            <GlobalCode designer={props.designer} />
                        </FTabPane>
                    </FTabs>
                </div>
            );
        };
    },
});
