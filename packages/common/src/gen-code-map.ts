import type { ICodeItem, ICodeStruct } from '@webank/letgo-types';

export function genCodeMap(code: ICodeStruct, codeMap: Map<string, ICodeItem> = new Map<string, ICodeItem>()) {
    if (code) {
        code.code?.forEach((item) => {
            codeMap.set(item.id, item);
        });

        code.directories?.forEach((directory) => {
            directory.code.forEach((item) => {
                codeMap.set(item.id, item);
            });
        });
    }
    return codeMap;
}
