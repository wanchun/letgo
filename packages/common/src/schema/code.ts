import type { ICodeDirectory, ICodeItem, ICodeStruct } from '@webank/letgo-types';

interface ExtendedDirectory {
    directoryId?: string;
}

export type ICodeItemWithDirectory = ICodeItem & ExtendedDirectory;

export function flatCodeStruct(codeStruct: ICodeStruct) {
    const codeMapWithDirectory = new Map<string, ICodeItemWithDirectory>();

    if (codeStruct) {
        codeStruct.code?.forEach((item) => {
            codeMapWithDirectory.set(item.key, item);
        });

        codeStruct.directories?.forEach((directory) => {
            directory.code.forEach((item) => {
                codeMapWithDirectory.set(item.key, {
                    ...item,
                    directoryId: directory.id,
                });
            });
        });
    }
    return codeMapWithDirectory;
}

export function compositeCodeStruct(codeMapWithDirectory: Map<string, ICodeItemWithDirectory>, currentCode: ICodeStruct, nextCode: ICodeStruct) {
    const codeStruct: ICodeStruct = {
        code: [],
        directories: [],
    };

    for (const codeItem of nextCode.code) {
        const codeItemWithDirectory = codeMapWithDirectory.get(codeItem.key);
        if (codeItemWithDirectory.directoryId)
            continue;

        codeStruct.code.push(codeItemWithDirectory);
    }
    for (const [index, codeItem] of currentCode.code.entries()) {
        if (!codeStruct.code.find(item => item.key === codeItem.key))
            codeStruct.code.splice(index, 0, codeItem);
    }

    for (const directory of nextCode.directories) {
        const newDirectory: ICodeDirectory = {
            id: directory.id,
            code: [],
        };
        for (const codeItem of directory.code) {
            const { directoryId, ...newCodeItem } = codeMapWithDirectory.get(codeItem.key);
            if (directoryId === directory.id)
                newDirectory.code.push(newCodeItem);
        }
        codeStruct.directories.push(newDirectory);
    }
    for (const [index, directory] of currentCode.directories.entries()) {
        if (!codeStruct.directories.find(item => directory.id === item.id)) {
            const newDirectory: ICodeDirectory = {
                id: directory.id,
                code: [],
            };
            for (const codeItem of directory.code) {
                const { directoryId, ...newCodeItem } = codeMapWithDirectory.get(codeItem.key);
                if (directory.id === directoryId)
                    newDirectory.code.push(newCodeItem);
            }
            codeStruct.directories.splice(index, 0, newDirectory);
        }
    }

    return codeStruct;
}
