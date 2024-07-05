import type { PropType } from 'vue';
<<<<<<< HEAD
<<<<<<< HEAD
import { computed, defineComponent, ref, watch } from 'vue';
=======
import { defineComponent, ref } from 'vue';
>>>>>>> 775d4528 (fix: 优化 class code 编辑器)
=======
import { computed, defineComponent, ref, watch } from 'vue';
>>>>>>> d85045f4 (fix: 优化代码提示)
import type { Designer } from '@webank/letgo-designer';
import { valueToType } from '@webank/letgo-common';
import type { Monaco } from '@webank/letgo-components';
import { MonacoEditor } from '@webank/letgo-components';
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

        const pageClassTs = computed(() => {
            return `
             declare class Page {
                $context: ${valueToType(project.extraGlobalState.$context, 4)};
                $utils:  ${valueToType(project.extraGlobalState.$utils, 3)};
                $refs:  ${valueToType(project.currentDocument.state.componentsInstance, 2)};
                $request: (url: string, params: Record<string, any>, options: Record<string, any>) => Promise<any>;
                $pageCode: Record<string, any>;
                $globalCode:  Record<string, any>;
            }
            `;
        });

        let currentMonaco: Monaco;
        const editorDidMount = (monaco: Monaco) => {
            currentMonaco = monaco;
            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: false,
                noSyntaxValidation: false,
                noSuggestionDiagnostics: true,
            });

            monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                target: monaco.languages.typescript.ScriptTarget.ES2020,
                allowNonTsExtensions: true,
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                module: monaco.languages.typescript.ModuleKind.CommonJS,
                noEmit: true,
                esModuleInterop: true,
                allowJs: true,
                typeRoots: ['node_modules/@types'],
            });

            monaco.languages.typescript.javascriptDefaults.addExtraLib(
                pageClassTs.value,
                `ts:/page.tsx`,
            );
        };

        watch(pageClassTs, () => {
            if (currentMonaco) {
                currentMonaco.languages.typescript.javascriptDefaults.addExtraLib(
                    pageClassTs.value,
                    `ts:/page.tsx`,
                );
            }
        });

        const onChange = (val: string) => {
            tmp.value = val;
        };

        const monacoEditorRef = ref();
        const onSave = async () => {
            try {
                const value = await monacoEditorRef.value.getFormatValue();
                if (value != null)
                    project.currentDocument.classCode = value;
            }
            catch (_) {

            }
        };

        return () => {
            return (
                <div class="letgo-plg-logic">
                    <MonacoEditor
                        ref={monacoEditorRef}
                        class="letgo-plg-logic__code"
                        height="100%"
                        language="javascript"
                        path="__class_code.js"
                        value={tmp.value}
                        onChange={onChange}
                        fullScreen
                        editorDidMount={editorDidMount}
                    >
                    </MonacoEditor>
                    <div class="letgo-plg-logic__action">
                        <FButton type="info" size="small" onClick={onSave}>保存</FButton>
                    </div>
                </div>
            );
        };
    },
});
