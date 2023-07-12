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

import type { Designer } from '@fesjs/letgo-designer';
import type { Editor } from '@fesjs/letgo-editor-core';
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
                                    name="编辑"
                                    value="code"
                                    displayDirective="show"
                                >
                                    <CodeSetting designer={props.designer} />
                                </FTabPane>
                                <FTabPane
                                    name="查看"
                                    value="state"
                                    displayDirective="show"
                                >
                                    <State designer={props.designer} />
                                </FTabPane>
                            </FTabs>
                        </FScrollbar>
                    </div>
                    <div class={rightPanelCls}>
                        <CodeEdit designer={props.designer} />
                    </div>
                </div>
            );
        };
    },
});
