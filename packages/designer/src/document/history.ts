import type { IPublicModelHistory, IPublicTypeDisposable, IPublicTypeNodeSchema } from '@webank/letgo-types';
import { EventEmitter } from 'eventemitter3';
import { nextTick, watch } from 'vue';
import { isEqual, isNil } from 'lodash-es';
import type { DocumentModel } from './document-model';

export interface Serialization<K = IPublicTypeNodeSchema, T = string> {
    serialize: (data: K) => T;
    unSerialize: (data: T) => K;
}

export interface IHistory extends IPublicModelHistory {
    onStateChange: (func: () => any) => IPublicTypeDisposable;
}

function orderedStringify(obj: Record<string, any>) {
    const keys = Object.keys(obj).sort(); // 按照属性名称排序
    const result: Record<string, any> = {};

    keys.forEach((key) => {
        result[key] = obj[key];
    });

    return JSON.stringify(result);
}

export class History<T = IPublicTypeNodeSchema> implements IHistory {
    private session: Session;

    private records: Session[];

    private point = 0;

    private emitter = new EventEmitter();

    private asleep = false;

    private currentSerialization: Serialization<T, string> = {
        serialize(data: T): string {
            return orderedStringify(data);
        },
        unSerialize(data: string) {
            return JSON.parse(data);
        },
    };

    get hotData() {
        return this.session.data;
    }

    private timeGap: number = 1000;

    constructor(
        dataFn: () => T | null,
        private handleChange: (data: T) => void,
        private document?: DocumentModel,
    ) {
        this.session = new Session(0, null, this.timeGap);
        this.records = [this.session];

        watch(dataFn, (data: T, oldData: T) => {
            if (isNil(data))
                return;

            if (this.asleep)
                return;

            if (isEqual(data, oldData))
                return;

            const log = this.currentSerialization.serialize(data);

            // do not record unchanged data
            if (this.session.data === log)
                return;

            if (this.session.isActive()) {
                this.session.log(log);
            }
            else {
                this.session.end();
                const lastState = this.getState();
                const cursor = this.session.cursor + 1;
                const session = new Session(cursor, log, this.timeGap);
                this.session = session;
                this.records.splice(cursor, this.records.length - cursor, session);
                const currentState = this.getState();

                if (currentState !== lastState)
                    this.emitter.emit('statechange', currentState);
            }
        }, {
            immediate: true,
        });
    }

    setSerialization(serialization: Serialization<T, string>) {
        this.currentSerialization = serialization;
    }

    isSavePoint(): boolean {
        return this.point !== this.session.cursor;
    }

    private sleep() {
        this.asleep = true;
    }

    private wakeUp() {
        this.asleep = false;
    }

    go(originalCursor: number) {
        this.session.end();

        let cursor = originalCursor;
        cursor = +cursor;
        if (cursor < 0)
            cursor = 0;
        else if (cursor >= this.records.length)
            cursor = this.records.length - 1;

        const currentCursor = this.session.cursor;
        if (cursor === currentCursor)
            return;

        const session = this.records[cursor];
        const hotData = session.data;

        this.sleep();
        try {
            this.handleChange(this.currentSerialization.unSerialize(hotData));
            this.emitter.emit('cursor', hotData);
        }
        catch (e) /* istanbul ignore next */ {
            console.error(e);
        }

        // 保证handleChange导致的状态变化执行时， asleep = true
        nextTick(() => {
            this.wakeUp();
            this.session = session;
            this.emitter.emit('statechange', this.getState());
        });
    }

    back() {
        if (!this.session)
            return;

        const cursor = this.session.cursor - 1;
        this.go(cursor);
        const editor = this.document?.designer.editor;
        if (!editor)
            return;

        editor.emit('history.back', cursor);
    }

    forward() {
        if (!this.session)
            return;

        const cursor = this.session.cursor + 1;
        this.go(cursor);
        const editor = this.document?.designer.editor;
        if (!editor)
            return;

        editor.emit('history.forward', cursor);
    }

    savePoint() {
        if (!this.session)
            return;

        this.session.end();
        this.point = this.session.cursor;
        this.emitter.emit('statechange', this.getState());
    }

    /**
     *  |    1     |     1    |    1     |
     *  | -------- | -------- | -------- |
     *  | modified | redoable | undoable |
     */
    getState(): number {
        const { cursor } = this.session;
        let state = 7;
        // undoable ?
        if (cursor <= 0)
            state -= 1;

        // redoable ?
        if (cursor >= this.records.length - 1)
            state -= 2;

        // modified ?
        if (this.point === cursor)
            state -= 4;

        return state;
    }

    /**
     * 监听 state 变更事件
     * @param func
     * @returns
     */
    onStateChange(func: () => any): IPublicTypeDisposable {
        this.emitter.on('statechange', func);
        return () => {
            this.emitter.off('statechange', func);
        };
    }

    /**
     * 监听历史记录游标位置变更事件
     * @param func
     * @returns
     */
    onCursorChange(func: () => any): () => void {
        this.emitter.on('cursor', func);
        return () => {
            this.emitter.off('cursor', func);
        };
    }

    /**
     *
     * @deprecated
     * @returns
     * @memberof History
     */
    isModified() {
        return this.isSavePoint();
    }

    purge() {
        this.emitter.removeAllListeners();
        this.records = [];
        this.session.purge();
    }
}

export class Session {
    private _data: any;

    private activeTimer: any;

    get data() {
        return this._data;
    }

    constructor(readonly cursor: number, data: any, private timeGap: number = 1000) {
        this.setTimer();
        this.log(data);
    }

    log(data: any) {
        if (!this.isActive())
            return;

        this._data = data;
        this.setTimer();
    }

    isActive() {
        return this.activeTimer != null;
    }

    end() {
        if (this.isActive())
            this.clearTimer();
    }

    private setTimer() {
        this.clearTimer();
        this.activeTimer = setTimeout(() => this.end(), this.timeGap);
    }

    private clearTimer() {
        if (this.activeTimer)
            clearTimeout(this.activeTimer);

        this.activeTimer = null;
    }

    purge() {
        this._data = null;
        this.clearTimer();
    }
}
