import { EventEmitter } from 'eventemitter3';
import { wrapWithEventSwitch } from '@webank/letgo-editor-core';
import { markComputed, markReactive } from '@webank/letgo-utils';
import type { CodeItem, CodeStruct, CodeType } from '@webank/letgo-types';
import { codeBaseEdit } from './code-base';

export class Code {
    private emitter = new EventEmitter();
    codeStruct: CodeStruct;
    codeMap: Map<string, CodeItem>;
    constructor(codeStruct?: CodeStruct) {
        codeStruct = codeStruct || {
            directories: [],
            code: [],
        };
        markReactive(this, {
            codeStruct,
        });
        markComputed(this, ['directories', 'code']);

        this.codeMap = this.genCodeMap(codeStruct);
    }

    get directories() {
        return this.codeStruct.directories;
    }

    get code() {
        return this.codeStruct.code;
    }

    private genCodeMap(code: CodeStruct) {
        const codeMap = new Map<string, CodeItem>();

        code.code.forEach((item) => {
            codeMap.set(item.id, item);
        });

        code.directories.forEach((directory) => {
            directory.code.forEach((item) => {
                codeMap.set(item.id, item);
            });
        });

        return codeMap;
    }

    hasCodeId = (id: string) => {
        return this.codeMap.has(id);
    };

    private onEvent(name: string, func: (...args: any[]) => void) {
        const wrappedFunc = wrapWithEventSwitch(func);
        this.emitter.on(name, wrappedFunc);
        return () => {
            this.emitter.off(name, wrappedFunc);
        };
    }

    emitCodeIdChanged(id: string, preId: string) {
        this.emitter.emit('codeIdChanged', id, preId);
    }

    onCodeIdChanged = (func: (id: string, preId: string) => void) => {
        return this.onEvent('codeIdChanged', func);
    };

    changeCodeId = (id: string, preId: string) => {
        const item = this.codeMap.get(preId);
        if (item) {
            // TODO 所有 deps 依赖了该 code 的都需要变
            item.id = id;
            this.codeMap.delete(preId);
            this.codeMap.set(id, item);
            this.emitCodeIdChanged(id, preId);
        }
    };

    genCodeId = (type: CodeType) => {
        const reg = new RegExp(`^${type}(\\d+)$`);
        let idSuffix = 0;
        for (const key of this.codeMap.keys()) {
            const matchResult = key.match(reg);
            if (matchResult && Number(matchResult[1]) > idSuffix)
                idSuffix = Number(matchResult[1]);
        }
        return `${type}${idSuffix + 1}`;
    };

    emitCodeItemAdd(codeItem: CodeItem) {
        this.emitter.emit('codeItemAdd', codeItem);
    }

    onCodeItemAdd = (func: (codeItem: CodeItem) => void) => {
        return this.onEvent('codeItemAdd', func);
    };

    addCodeItem = (type: CodeType) => {
        const id = this.genCodeId(type);
        const item = codeBaseEdit[type].addCode(id);

        this.codeStruct.code.push(item);
        const newCodeItem = this.codeStruct.code[this.codeStruct.code.length - 1];
        this.codeMap.set(id, newCodeItem);
        this.emitCodeItemAdd(newCodeItem);
    };

    emitCodeItemDelete(id: string) {
        this.emitter.emit('codeItemDelete', id);
    }

    onCodeItemDelete = (func: (id: string) => void) => {
        return this.onEvent('codeItemDelete', func);
    };

    deleteCodeItem = (id: string) => {
        const index = this.codeStruct.code.findIndex(item => item.id === id);
        if (index !== -1) {
            this.codeMap.delete(id);
            this.codeStruct.code.splice(index, 1);
        }
        else {
            for (const directory of this.codeStruct.directories) {
                for (const [index, item] of directory.code.entries()) {
                    if (item.id === id) {
                        this.codeMap.delete(id);
                        directory.code.splice(index, 1);
                        return;
                    }
                }
            }
        }
        this.emitCodeItemDelete(id);
    };

    emitCodeItemChange(id: string, content: Record<string, any>) {
        this.emitter.emit('codeItemChanged', id, content);
    }

    onCodeItemChanged = (func: (id: string, content: Record<string, any>) => void) => {
        return this.onEvent('codeItemChanged', func);
    };

    changeCodeItemContent = (id: string, content: Record<string, any>) => {
        const item = this.codeMap.get(id);
        Object.assign(item, content);
        this.emitCodeItemChange(id, content);
    };

    purge() {
        this.emitter.removeAllListeners();
    }
}