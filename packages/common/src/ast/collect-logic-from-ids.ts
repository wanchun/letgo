import type { ICodeItem, ICodeStruct, IPublicModelDocumentModel } from '@webank/letgo-types';
import { merge } from 'lodash-es';
import { traverseCodes } from './walk-schema-logic';
import { findGlobals } from './find-globals';

function purePickCodeItem(ids: Set<string>, codeStruct: ICodeStruct, matchIds: Set<string>) {
    const targetCodeStruct: ICodeStruct = {
        directories: [],
        code: [],
    };
    for (const codeItem of codeStruct.code) {
        if (!matchIds.has(codeItem.id) && ids.has(codeItem.id)) {
            matchIds.add(codeItem.id);
            targetCodeStruct.code.push(codeItem);
        }
    }
    for (const directory of codeStruct.directories) {
        for (const codeItem of directory.code) {
            if (!matchIds.has(codeItem.id) && ids.has(codeItem.id)) {
                matchIds.add(codeItem.id);
                const targetDirectory = targetCodeStruct.directories.find(item => item.id === directory.id);
                if (!targetDirectory) {
                    targetCodeStruct.directories.push({
                        id: directory.id,
                        code: [codeItem],
                    });
                }
                else {
                    targetDirectory.code.push(codeItem);
                }
            }
        }
    }
    return targetCodeStruct;
}

function pickCodeItem(ids: Set<string>, codeStruct: ICodeStruct, collectedIds: Set<string>) {
    const codes: ICodeItem[] = [];
    for (const codeItem of codeStruct.code) {
        if (!collectedIds.has(codeItem.id) && ids.has(codeItem.id)) {
            collectedIds.add(codeItem.id);
            codes.push(codeItem);
        }
    }
    for (const directory of codeStruct.directories) {
        for (const codeItem of directory.code) {
            if (!collectedIds.has(codeItem.id) && ids.has(codeItem.id)) {
                collectedIds.add(codeItem.id);
                codes.push(codeItem);
            }
        }
    }
    return codes;
}

function collectIds(ids: Set<string>, doc: IPublicModelDocumentModel, collectedIds: Set<string>) {
    let codes: ICodeItem[] = pickCodeItem(ids, doc.code.codeStruct, collectedIds);
    codes = codes.concat(pickCodeItem(ids, doc.project.code.codeStruct, collectedIds));

    ids.forEach(collectedIds.add, collectedIds);

    const referencesIds = new Set<string>();
    traverseCodes(codes, (code: string, _, type) => {
        try {
            code = type === 'JSExpression' ? `(${code})` : code;
            const globalNodes = findGlobals(code);

            globalNodes.forEach((item) => {
                if (!collectedIds.has(item.name))
                    referencesIds.add(item.name);
            });
        }
        catch (_) {
        }
    });
    if (referencesIds.size)
        collectIds(referencesIds, doc, collectedIds);
}

export function collectLogicFromIds(ids: string[], doc: IPublicModelDocumentModel): [ICodeStruct, Set<string>] {
    const collectedIds = new Set<string>();

    collectIds(new Set(ids), doc, collectedIds);

    const codeStruct: ICodeStruct = {
        directories: [],
        code: [],
    };
    const matchIds = new Set<string>();
    merge(codeStruct, purePickCodeItem(collectedIds, doc.code.codeStruct, matchIds));
    merge(codeStruct, purePickCodeItem(collectedIds, doc.project.code.codeStruct, matchIds));

    const unMatchIds = new Set<string>();
    for (const id of collectedIds) {
        if (!matchIds.has(id))
            unMatchIds.add(id);
    }

    return [codeStruct, unMatchIds];
}
