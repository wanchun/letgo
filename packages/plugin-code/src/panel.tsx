import type {
    PropType,
} from 'vue';
import {
    computed,
    defineComponent,
    ref,
} from 'vue';
import {
    FInput,
    FScrollbar,
    FTabPane,
    FTabs,
} from '@fesjs/fes-design';
import type { Designer } from '@webank/letgo-designer';
import type { Editor } from '@webank/letgo-editor-core';
import { SearchOutlined } from '@fesjs/fes-design/icon';
import State from './state/state';
import { GlobalCode } from './global-code/code';
import CodeSetting from './code/code';
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
        const current = ref('code');

        const rootSchemaType = computed(() => {
            return props.designer.currentDocument?.root.componentName;
        });

        const searchValue = ref();

        const rootEl = ref();

        const onSearch = (val: string) => {
            searchValue.value = val;
        };

        return () => {
            return (
                <div ref={rootEl} class="letgo-plg-code">
                    <div class="letgo-plg-code__search">
                        <FInput
                            placeholder="请输入"
                            clearable
                            onInput={onSearch}
                            v-slots={{
                                suffix: () => <SearchOutlined />,
                            }}
                        >
                        </FInput>
                    </div>
                    <FTabs class="letgo-plg-code__tabs" v-model={current.value}>
                        <FTabPane
                            name="页面逻辑"
                            value="code"
                            displayDirective="show"
                        >
                            <CodeSetting rootEl={rootEl.value} searchText={searchValue.value} currentTab={current.value} designer={props.designer} />
                        </FTabPane>
                        {rootSchemaType.value === 'Page' && (
                            <FTabPane
                                name="全局逻辑"
                                value="globalLogic"
                                displayDirective="show"
                            >
                                <GlobalCode rootEl={rootEl.value} searchText={searchValue.value} currentTab={current.value} designer={props.designer} />
                            </FTabPane>
                        )}
                        <FTabPane
                            name="查看"
                            value="state"
                            displayDirective="show"
                        >
                            <FScrollbar>
                                <State searchText={searchValue.value} designer={props.designer} />
                            </FScrollbar>
                        </FTabPane>
                    </FTabs>
                </div>
            );
        };
    },
});
