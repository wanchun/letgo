import type { PropType } from 'vue';
import { computed, defineComponent, ref, watch } from 'vue';
import type { Designer } from '@webank/letgo-designer';
import { CodeEditor } from '@webank/letgo-components';
import { FButton } from '@fesjs/fes-design';

// 默认 class code 模板
const DEFAULT_CLASS_CODE = `
/**
 * 内置属性
 * this.$context 获取全局上下文
 * this.$utils 获取绑定的库 or 方法
 * this.$refs 获取当前页面实例
 * 
 * this.$request(url, params, options) 发起请求
 * 
 * this.$pageCode  获取页面逻辑
 * this.$globalCode  获取全局逻辑
 */
class Main extends Page {
  constructor(ctx) {
    super(ctx);
  }
}
`;

export const JsEditView = defineComponent({
    name: 'JsEditView',
    props: {
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup(props) {
        const { designer } = props;
        const { project } = designer;

        const tmp = ref((project.currentDocument.classCode || DEFAULT_CLASS_CODE).trim());

        let destroy: () => void;
        watch(() => project.currentDocument, (doc) => {
            if (destroy)
                destroy();

            destroy = doc.onClassCodeChange((val) => {
                if (tmp.value !== val)
                    tmp.value = val;
            });
        }, {
            immediate: true,
        });

        const onChange = (val: string) => {
            tmp.value = val;
        };

        // Refactor 简单版本, 后续优化
        const hints = computed(() => {
            return {
                codesInstance: {
                    this: project.currentDocument.state.codesInstance.this,
                },
            };
        });

        const onSave = () => {
            try {
                project.currentDocument.classCode = tmp.value;
            }
            catch (e) {
                console.error(e);
            }
        };

        return () => {
            return (
                <div class="letgo-plg-logic">
                    <CodeEditor
                        hints={hints.value}
                        class="letgo-plg-logic__code"
                        height="100%"
                        id="__class_code"
                        theme={{
                            '&': {
                                border: '1px solid var(--letgo-border-color)',
                                borderRadius: 0,
                                borderRight: 'none',
                                borderLeft: 'none',
                                height: '100%',
                            },
                        }}
                        doc={tmp.value}
                        onChange={onChange}
                        bordered={false}
                        lineNumbers={true}
                        fullscreen={false}
                    >
                    </CodeEditor>
                    <div class="letgo-plg-logic__action">
                        <FButton type="info" size="small" onClick={onSave}>保存</FButton>
                    </div>
                </div>
            );
        };
    },
});
