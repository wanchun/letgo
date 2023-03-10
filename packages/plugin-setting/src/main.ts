import { EventEmitter } from 'eventemitter3';
import { Editor } from '@webank/letgo-editor-core';
import { Node, Designer, Selection, SettingTop } from '@webank/letgo-designer';
import { shallowRef, ShallowRef } from 'vue';

function generateSessionId(nodes: Node[]) {
    return nodes
        .map((node) => node.id)
        .sort()
        .join(',');
}

export class SettingsMain {
    private emitter = new EventEmitter();

    private _sessionId = '';

    private _settings: ShallowRef<SettingTop> = shallowRef();

    private _currentNode: ShallowRef<Node> = shallowRef();

    get length(): number | undefined {
        return this.settings?.nodes.length;
    }

    get componentMeta() {
        return this.settings?.componentMeta;
    }

    get settings() {
        return this._settings.value;
    }

    get currentNode() {
        return this._currentNode.value;
    }

    private disposeListener: () => void;

    constructor(readonly editor: Editor, readonly designer: Designer) {
        this.init();
    }

    private async init() {
        const setupSelection = (selection?: Selection) => {
            if (selection) {
                this.setup(selection.getNodes());
            } else {
                this.setup([]);
            }
        };
        this.editor.on('designer.selection.change', setupSelection);
        this.disposeListener = () => {
            this.editor.removeListener(
                'designer.selection.change',
                setupSelection,
            );
        };
        setupSelection(this.designer.getCurrentSelection());
    }

    private setup(nodes: Node[]) {
        // check nodes change
        const sessionId = generateSessionId(nodes);
        if (sessionId === this._sessionId) {
            return;
        }
        this._sessionId = sessionId;
        if (nodes.length < 1) {
            this._settings.value = undefined;
            return;
        }

        this._currentNode.value = nodes[0];

        // 当节点只有一个时，复用 node 上挂载的 settingEntry，不会产生平行的两个实例，这样在整个系统中对
        // 某个节点操作的 SettingTopEntry 只有一个实例，后续的 getProp() 也会拿到相同的 SettingField 实例
        if (nodes.length === 1) {
            this._settings.value = nodes[0].settingEntry;
        } else {
            this._settings.value = this.designer.createSettingEntry(nodes);
        }
    }

    purge() {
        this.disposeListener();
        this.emitter.removeAllListeners();
    }
}
