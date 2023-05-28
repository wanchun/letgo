import { markComputed, markReactive } from '@webank/letgo-utils';
import type { CodeItem, CodeStruct, CodeType } from '@webank/letgo-types';
import { codeBaseEdit } from './code-base';

export class Code {
    codeStruct: CodeStruct;
    codeMap: Map<string, CodeItem>;
    constructor(codeStruct: CodeStruct) {
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

    hasCodeId(id: string) {
        return this.codeMap.has(id);
    }

    changeCodeId(id: string, preId: string) {
        const item = this.codeMap.get(preId);
        if (item) {
            // TODO 所有 deps 依赖了该 code 的都需要变
            item.id = id;
            this.codeMap.delete(preId);
            this.codeMap.set(id, item);
        }
    }

    genCodeId(type: CodeType) {
        const reg = new RegExp(`^${type}(\\d+)$`);
        let idSuffix = 0;
        for (const key of this.codeMap.keys()) {
            const matchResult = key.match(reg);
            if (matchResult && Number(matchResult[1]) > idSuffix)
                idSuffix = Number(matchResult[1]);
        }
        return `${type}${idSuffix + 1}`;
    }

    addCodeItem(type: CodeType) {
        const id = this.genCodeId(type);
        const item = codeBaseEdit[type].addCode(id);

        this.codeStruct.code.push(item);
        this.codeMap.set(id, this.codeStruct.code[this.codeStruct.code.length - 1]);
    }

    deleteCodeItem(id: string) {
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
    }

    changeCodeItemContent(id: string, content: Record<string, any>) {
        const item = this.codeMap.get(id);
        Object.assign(item, content);
    }
}
