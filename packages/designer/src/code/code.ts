import { EventEmitter } from 'eventemitter3';
import { wrapWithEventSwitch } from '@webank/letgo-editor-core';
import { markComputed, markReactive, replaceExpressionIdentifier, replaceJSFunctionIdentifier } from '@webank/letgo-common';
import { CodeType } from '@webank/letgo-types';
import type { CodeItem, CodeStruct } from '@webank/letgo-types';
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
        markComputed(this, ['directories', 'code', 'queries', 'temporaryStates']);

        this.codeMap = this.genCodeMap(codeStruct);
    }

    get directories() {
        return this.codeStruct.directories;
    }

    get queries() {
        return this.code.filter(item => item.type === CodeType.JAVASCRIPT_QUERY);
    }

    get temporaryStates() {
        return this.code.filter(item => item.type === CodeType.TEMPORARY_STATE);
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

    scopeVariableChange(id: string, newVariable: string, oldVariable: string) {
        const item = this.codeMap.get(id);

        if (item.type === CodeType.TEMPORARY_STATE) {
            this.changeCodeItemContent(id, {
                initValue: replaceExpressionIdentifier(item.initValue, newVariable, oldVariable),
            });
        }
        else if (item.type === CodeType.JAVASCRIPT_COMPUTED) {
            this.changeCodeItemContent(id, {
                funcBody: replaceExpressionIdentifier(item.funcBody, newVariable, oldVariable),
            });
        }
        else if (item.type === CodeType.JAVASCRIPT_QUERY) {
            // TODO 以后有变量依赖的不仅仅是 query 属性
            this.changeCodeItemContent(id, {
                query: replaceJSFunctionIdentifier(item.query, newVariable, oldVariable),
            });
        }
    }

    purge() {
        this.emitter.removeAllListeners();
    }
}
