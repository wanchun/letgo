import { EventEmitter } from 'eventemitter3';
import type { Editor } from '@webank/letgo-editor-core';
import type { Designer, INode, Selection, SettingTop } from '@webank/letgo-designer';
import { markComputed, markReactive } from '@webank/letgo-utils';

function generateSessionId(nodes: INode[]) {
    return nodes
        .map(node => node.id)
        .sort()
        .join(',');
}

export class SettingsMain {
    private emitter = new EventEmitter();

    private _sessionId = '';

    private _settings: SettingTop;

    private _currentNode: INode;

    get length(): number | undefined {
        return this.settings?.nodes.length;
    }

    get componentMeta() {
        return this.settings?.componentMeta;
    }

    get settings() {
        return this._settings;
    }

    get currentNode() {
        return this._currentNode;
    }

    private disposeListener: () => void;

    constructor(readonly editor: Editor, readonly designer: Designer) {
        markReactive(this, {
            _settings: undefined,
            _currentNode: undefined,
        });
        markComputed(this, ['settings', 'currentNode', 'componentMeta', 'length']);
        this.init();
    }

    private async init() {
        const setupSelection = (selection?: Selection) => {
            if (selection)
                this.setup(selection.getNodes());

            else
                this.setup([]);
        };
        this.editor.on('designer.selection.change', setupSelection);
        this.disposeListener = () => {
            this.editor.removeListener(
                'designer.selection.change',
                setupSelection,
            );
        };
        setupSelection(this.designer.currentSelection);
    }

    private setup(nodes: INode[]) {
        // check nodes change
        const sessionId = generateSessionId(nodes);
        if (sessionId === this._sessionId)
            return;

        this._sessionId = sessionId;
        if (nodes.length < 1) {
            this._settings = undefined;
            return;
        }

        this._currentNode = nodes[0];

        // 当节点只有一个时，复用 node 上挂载的 settingEntry，不会产生平行的两个实例，这样在整个系统中对
        // 某个节点操作的 SettingTopEntry 只有一个实例，后续的 getProp() 也会拿到相同的 SettingField 实例
        if (nodes.length === 1)
            this._settings = nodes[0].settingEntry;

        else
            this._settings = this.designer.createSettingEntry(nodes);
    }

    purge() {
        this.disposeListener();
        this.emitter.removeAllListeners();
    }
}
