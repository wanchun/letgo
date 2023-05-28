import type {
    PropType,
} from 'vue';
import {
    defineComponent,
} from 'vue';
import {
    FScrollbar,
    FTabPane,
    FTabs,
} from '@fesjs/fes-design';

import type { Designer } from '@webank/letgo-designer';
import type { Editor } from '@webank/letgo-editor-core';
import State from './state/state';
import CodeSetting from './code/code';
import CodeEdit from './code/edit/code-edit';
import { leftPanelCls, panelCls, rightPanelCls } from './panel.css';

export default defineComponent({
    props: {
        editor: {
            type: Object as PropType<Editor>,
        },
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup(props) {
        return () => {
            return (
                <div class={panelCls}>
                    <div class={leftPanelCls}>
                        <FScrollbar>
                            <FTabs>
                                <FTabPane
                                    name="code"
                                    value="code"
                                    displayDirective="show"
                                >
                                    <CodeSetting designer={props.designer} />
                                </FTabPane>
                                <FTabPane
                                    name="状态"
                                    value="state"
                                    displayDirective="show"
                                >
                                    <State designer={props.designer} />
                                </FTabPane>
                            </FTabs>
                        </FScrollbar>
                    </div>
                    <div class={rightPanelCls}>
                        <CodeEdit />
                    </div>
                </div>
            );
        };
    },
});
