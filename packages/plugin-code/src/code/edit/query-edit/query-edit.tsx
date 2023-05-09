import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { FButton } from '@fesjs/fes-design';
import type { JavascriptQuery } from '../../../interface';
import { contentCls, headerCls } from './query-edit.css';
import LeftActions from './left-actions';
import General from './general';

export default defineComponent({
    props: {
        codeItem: Object as PropType<JavascriptQuery>,
        changeContent: Function as PropType<(id: string, content: Partial<JavascriptQuery>) => void>,
    },
    setup(props) {
        const onSave = () => {
            // TODO 保存
            props.changeContent(props.codeItem.id, {

            });
        };
        return () => {
            return <div>
                <div class={headerCls}>
                    <LeftActions />
                    <span>{props.codeItem.id}</span>
                    <div>
                        <FButton type="primary" size="small"onClick={onSave}>保存</FButton>
                    </div>
                </div>
                <div class={contentCls}>
                    <General />
                </div>
            </div>;
        };
    },
});
