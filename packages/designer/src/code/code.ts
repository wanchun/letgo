import { EventEmitter } from 'eventemitter3';
import { wrapWithEventSwitch } from '@webank/letgo-editor-core';
import {
    markComputed,
    markReactive,
    replaceExpressionIdentifier,
    replaceJSFunctionIdentifier,
    uniqueId,
} from '@webank/letgo-common';
import { IEnumCodeType } from '@webank/letgo-types';
import type {
    ICodeDirectory,
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
        codeStruct = this.formatCodeStruct(codeStruct || {
            directories: [],
            code: [],
        });
        markReactive(this, {
            codeStruct,
        });
        markComputed(this, ['directories', 'code', 'queries', 'temporaryStates']);

        this.codeMap = this.genCodeMap(this.codeStruct);
    }

    private formatCodeStruct(codeStruct: ICodeStruct) {
        // 兼容老的 codeStruct，附上唯一 key
        let hasKey = false;
        for (const item of codeStruct.code) {
            if (item.key) {
                hasKey = true;
                break;
            }
            else {
                item.key = item.id;
            }
        }
        if (!hasKey) {
            codeStruct.directories.forEach((directory) => {
                directory.code.forEach((item) => {
                    if (!item.key)
                        item.key = item.id;
                });
            });
        }
        return codeStruct;
    }

    get directories() {
        return this.codeStruct.directories;
    }

    get queries() {
        return this.findCodes(IEnumCodeType.JAVASCRIPT_QUERY);
    }

    get temporaryStates() {
        return this.findCodes(IEnumCodeType.TEMPORARY_STATE);
    }

    get functions() {
        return this.findCodes(IEnumCodeType.JAVASCRIPT_FUNCTION);
    }

    get code() {
        return this.codeStruct.code;
    }

    private findCodes(type: IEnumCodeType) {
        const result: ICodeItem[] = [];
        this.codeStruct.code.forEach((item) => {
            if (item.type === type)
                result.push(item);
        });
        for (const directory of this.codeStruct.directories) {
            for (const codeItem of directory.code) {
                if (codeItem.type === type)
                    result.push(codeItem);
            }
        }
        return result;
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

    private findCodeItemsAndIndex(id: string): [ICodeItem[], number] {
        const index = this.codeStruct.code.findIndex(item => item.id === id);
        if (index !== -1) {
            return [this.codeStruct.code, index];
        }
        else {
            for (const directory of this.codeStruct.directories) {
                if (directory.id === id)
                    return [directory.code, -1];

                for (const [index, item] of directory.code.entries()) {
                    if (item.id === id)
                        return [directory.code, index];
                }
            }
        }
    }

    changePosition(id: string, referenceId: string, position: 'before' | 'inside' | 'after') {
        const [codeItems, index] = this.findCodeItemsAndIndex(id);
        if (codeItems && index != null)
            codeItems.splice(index, 1);

        const codeItem = this.getCodeItem(id);
        const [referenceCodeItems, referenceIndex] = this.findCodeItemsAndIndex(referenceId);
        if (referenceCodeItems && referenceIndex != null) {
            if (position === 'inside')
                referenceCodeItems.push(codeItem);
            else if (referenceIndex === -1)
                this.codeStruct.code.unshift(codeItem);
            else if (position === 'before')
                referenceCodeItems.splice(referenceIndex, 0, codeItem);
            else if (position === 'after')
                referenceCodeItems.splice(referenceIndex + 1, 0, codeItem);
        }
    }

    getCodeItem = (id: string) => {
        return this.codeMap.get(id);
    };

    getDirectory = (id: string) => {
        return this.directories.find(item => item.id === id);
    };

    ungroundDirectory = (id: string) => {
        const directoryIndex = this.directories.findIndex(item => item.id === id);
        if (directoryIndex !== -1) {
            const directory = this.directories[directoryIndex];
            this.codeStruct.code = this.codeStruct.code.concat(directory.code);
            this.codeStruct.directories.splice(directoryIndex, 1);
        }
    };

    deleteDirectory = (id: string) => {
        const directoryIndex = this.directories.findIndex(item => item.id === id);
        if (directoryIndex !== -1) {
            const directory = this.directories[directoryIndex];
            this.codeStruct.directories.splice(directoryIndex, 1);

            for (const item of directory.code) {
                this.codeMap.delete(item.id);
                this.emitCodeItemDelete(id);
            }
        }
    };

    changeDirectoryId = (id: string, preId: string) => {
        const directory = this.getDirectory(preId);
        if (directory)
            directory.id = id;
    };

    hasCodeId = (id: string) => {
        return this.codeMap.has(id) || this.directories.some(item => item.id === id);
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

    genCodeId = (type: IEnumCodeType | 'variable' | 'folder'): string => {
        if (type === IEnumCodeType.TEMPORARY_STATE)
            type = 'variable';

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

    addDirectory = (id?: string) => {
        if (id) {
            const directory = this.getDirectory(id);
            if (directory)
                return directory;
        }

        const folder: ICodeDirectory = {
            id: id || this.genCodeId('folder'),
            code: [],
        };
        this.codeStruct.directories.push(folder);

        return this.codeStruct.directories.at(-1);
    };

    addCodeItemInDirectory = (directoryId: string, typeOrCodeItem: IEnumCodeType | ICodeItem, resourceType?: IEnumResourceType) => {
        const directory = this.getDirectory(directoryId);
        let item: ICodeItem;
        if (typeof typeOrCodeItem === 'string') {
            const id = this.genCodeId(typeOrCodeItem);
            item = codeBaseEdit[typeOrCodeItem].addCode(id, resourceType);
        }
        else {
            item = typeOrCodeItem;
        }
        if (this.codeMap.has(item.id))
            return item;

        directory.code.push(item);
        // 取响应式变量
        const newCodeItem = directory.code.at(-1);
        this.codeMap.set(item.id, newCodeItem);
        this.emitCodeItemAdd(newCodeItem);

        return item;
    };

    addCodeItemWithType = (type: IEnumCodeType, resourceType?: IEnumResourceType) => {
        const id = this.genCodeId(type);
        const item = codeBaseEdit[type].addCode(id, resourceType);
        this.addCodeItem(item);
        return item;
    };

    addCodeItem = (item: ICodeItem) => {
        if (this.codeMap.has(item.id))
            return;

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
            this.emitCodeItemDelete(id);
        }
        else {
            for (const directory of this.codeStruct.directories) {
                for (const [index, item] of directory.code.entries()) {
                    if (item.id === id) {
                        this.codeMap.delete(id);
                        directory.code.splice(index, 1);
                        this.emitCodeItemDelete(id);
                        return;
                    }
                }
            }
        }
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
