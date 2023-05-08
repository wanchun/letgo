import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { FButton } from '@fesjs/fes-design';
import type { JavascriptComputed } from '../../interface';
import Editor from '../../editor';
import { contentCls, headerCls } from './computed-edit.css';

/**
 * TODO 待实现功能
 * header 区域可编辑 id
 * header 区域可删除/复制
 */
export default defineComponent({
    props: {
        codeItem: Object as PropType<JavascriptComputed>,
        changeContent: Function as PropType<(id: string, content: Partial<JavascriptComputed>) => void>,
    },
    setup(props) {
        const changeInitValue = (value: string) => {
            props.changeContent(props.codeItem.id, {
                funcBody: value,
            });
        };

        const onSave = () => {

        };

        return () => {
            return <div>
                <div class={headerCls}>
                    <span></span>
                    <span>{props.codeItem.id}</span>
                    <div>
                        <FButton type="primary" size="small" onClick={onSave}>保存</FButton>
                    </div>
                </div>
                <div class={contentCls}>
                    <Editor />
                </div>
            </div>;
        };
    },
});
