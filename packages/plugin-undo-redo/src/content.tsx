import type { PropType } from 'vue';
import { defineComponent, onBeforeUnmount, ref } from 'vue';
import { GoOn, Return } from '@icon-park/vue-next';
import type { Designer } from '@webank/letgo-designer';
import type { IPublicTypeDisposable } from '@webank/letgo-types';
import { FTooltip } from '@fesjs/fes-design';
import './content.less';

export const UndoRedoView = defineComponent({
    name: 'UndoRedoView',
    props: {
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup(props) {
        const { designer } = props;
        const { project } = designer;

        const undoEnable = ref(false);
        const redoEnable = ref(false);

        const updateState = (state: number): void => {
            undoEnable.value = !!(state & 1);
            redoEnable.value = !!(state & 2);
        };

        const handleUndoClick = () => {
            if (undoEnable.value)
                designer.currentHistory.back();
        };

        const handleRedoClick = () => {
            if (redoEnable.value)
                designer.currentHistory.forward();
        };

        let changeStateDispose: IPublicTypeDisposable | undefined;

        changeStateDispose = designer.currentHistory.onStateChange(() => {
            updateState(designer.currentHistory?.getState() || 0);
        });

        const changeDocumentDispose = project.onCurrentDocumentChange((doc) => {
            const history = doc.history;
            updateState(history?.getState() || 0);
            changeStateDispose?.();
            changeStateDispose = history.onStateChange(() => {
                updateState(history?.getState() || 0);
            });
        });

        onBeforeUnmount(() => {
            changeDocumentDispose?.();
            changeStateDispose?.();
        });

        return () => {
            return (
                <div class="letgo-plg-undo-redo">
                    <FTooltip content="撤销" placement="top">
                        <span class={['letgo-plg-undo-redo__icon', { 'is-disabled': !undoEnable.value }]} onClick={handleUndoClick}>
                            <Return theme="outline" size="20" />
                        </span>
                    </FTooltip>
                    <FTooltip content="恢复" placement="top">
                        <span class={['letgo-plg-undo-redo__icon', { 'is-disabled': !redoEnable.value }]} onClick={handleRedoClick}>
                            <GoOn theme="outline" size="20" />
                        </span>
                    </FTooltip>
                </div>
            );
        };
    },
});
