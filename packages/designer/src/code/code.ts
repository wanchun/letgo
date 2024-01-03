import { EventEmitter } from 'eventemitter3';
import { wrapWithEventSwitch } from '@webank/letgo-editor-core';
import {
    markComputed,
    markReactive,
    replaceExpressionIdentifier,
    replaceJSFunctionIdentifier,
} from '@webank/letgo-common';
import { IEnumCodeType } from '@webank/letgo-types';
import type {
    ICodeItem,
    ICodeStruct,
    IEnumResourceType,
    IPublicModelCode,
} from '@webank/letgo-types';
import { codeBaseEdit } from './code-base';

const idCount: Record<string, number> = {};

export class Code implements IPublicModelCode {
    private emitter = new EventEmitter();
    codeStruct: ICodeStruct;
    codeMap: Map<string, ICodeItem>;
    constructor(codeStruct?: ICodeStruct) {
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
        return this.code.filter(item => item.type === IEnumCodeType.JAVASCRIPT_QUERY);
    }

    get temporaryStates() {
        return this.code.filter(item => item.type === IEnumCodeType.TEMPORARY_STATE);
    }

    get functions() {
        return this.code.filter(item => item.type === IEnumCodeType.JAVASCRIPT_FUNCTION);
    }

    get code() {
        return this.codeStruct.code;
    }

    private genCodeMap(code: ICodeStruct) {
        const codeMap = new Map<string, ICodeItem>();
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

    private onEvent(name: string, func: (...args: any[]) => void) {
        const wrappedFunc = wrapWithEventSwitch(func);
        this.emitter.on(name, wrappedFunc);
        return () => {
            this.emitter.off(name, wrappedFunc);
        };
    }

    hasCodeId = (id: string) => {
        return this.codeMap.has(id);
    };

    onCodesChanged = (func: (currentCodeMap: Map<string, ICodeItem>) => void) => {
        return this.onEvent('codesChanged', func);
    };

    initCode(codeStruct?: ICodeStruct) {
        this.codeStruct = codeStruct || {
            directories: [],
            code: [],
        };
        this.codeMap = this.genCodeMap(this.codeStruct);
        this.emitter.emit('codesChanged', this.codeMap);
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
            item.id = id;
            this.codeMap.delete(preId);
            this.codeMap.set(id, item);
            this.emitCodeIdChanged(id, preId);
        }
    };

    genCodeId = (type: IEnumCodeType): string => {
        idCount[type] = (idCount[type] || 0) + 1;
        const newId = `${type}${idCount[type]}`;
        if (this.hasCodeId(newId))
            return this.genCodeId(type);

        return newId;
    };

    emitCodeItemAdd(codeItem: ICodeItem) {
        this.emitter.emit('codeItemAdd', codeItem);
    }

    onCodeItemAdd = (func: (codeItem: ICodeItem) => void) => {
        return this.onEvent('codeItemAdd', func);
    };

    addCodeItemWithType = (type: IEnumCodeType, resourceType?: IEnumResourceType) => {
        const id = this.genCodeId(type);
        const item = codeBaseEdit[type].addCode(id, resourceType);
        this.addCodeItem(item);
    };

    addCodeItem = (item: ICodeItem) => {
        this.codeStruct.code.push(item);
        const newCodeItem = this.codeStruct.code[this.codeStruct.code.length - 1];
        this.codeMap.set(item.id, newCodeItem);
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

    _changeDepStateId(newVariable: string, oldVariable: string) {
        for (const item of this.codeMap.values())
            this.scopeVariableChange(item.id, newVariable, oldVariable);
    }

    changeDepStateId(newVariable: string, oldVariable: string) {
        requestIdleCallback(this._changeDepStateId.bind(this, newVariable, oldVariable));
    }

    scopeVariableChange(id: string, newVariable: string, oldVariable: string) {
        const item = this.codeMap.get(id);

        if (item.type === IEnumCodeType.TEMPORARY_STATE) {
            const initValue = replaceExpressionIdentifier(item.initValue, newVariable, oldVariable);
            if (item.initValue !== initValue) {
                this.changeCodeItemContent(item.id, {
                    initValue,
                });
            }
        }
        else if (item.type === IEnumCodeType.JAVASCRIPT_COMPUTED) {
            const funcBody = replaceJSFunctionIdentifier(item.funcBody, newVariable, oldVariable);
            if (item.funcBody !== funcBody) {
                this.changeCodeItemContent(item.id, {
                    funcBody,
                });
            }
        }
        else if (item.type === IEnumCodeType.JAVASCRIPT_FUNCTION) {
            const funcBody = replaceJSFunctionIdentifier(item.funcBody, newVariable, oldVariable);
            if (item.funcBody !== funcBody) {
                this.changeCodeItemContent(item.id, {
                    funcBody,
                });
            }
        }
        else if (item.type === IEnumCodeType.JAVASCRIPT_QUERY) {
            // TODO 以后有变量依赖的不仅仅是 query 属性
            const query = replaceJSFunctionIdentifier(item.query, newVariable, oldVariable);
            if (item.query !== query) {
                this.changeCodeItemContent(item.id, {
                    query,
                });
            }
        }
    }

    purge() {
        this.emitter.removeAllListeners();
    }
}
