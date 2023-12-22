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
import { GlobalCode } from './global-code/code';
import CodeSetting from './code/code';
import CodeEdit from './code/edit/code-edit';
import './panel.less';

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
                <div class="letgo-plg-code">
                    <FTabs class="letgo-plg-code__tabs">
                        <FTabPane
                            name="页面逻辑"
                            value="code"
                            displayDirective="show"
                        >
                            <div class="letgo-plg-code__edit">
                                <FScrollbar class="letgo-plg-code__edit-left">
                                    <CodeSetting designer={props.designer} />
                                </FScrollbar>
                                <FScrollbar class="letgo-plg-code__edit-right">
                                    <CodeEdit designer={props.designer} />
                                </FScrollbar>
                            </div>
                        </FTabPane>
                        <FTabPane
                            name="全局逻辑"
                            value="globalLogic"
                            displayDirective="show"
                        >
                            <GlobalCode designer={props.designer} />
                        </FTabPane>
                        <FTabPane
                            name="查看"
                            value="state"
                            displayDirective="show"
                        >
                            <FScrollbar>
                                <State designer={props.designer} />
                            </FScrollbar>
                        </FTabPane>
                    </FTabs>
                </div>
            );
        };
    },
});
