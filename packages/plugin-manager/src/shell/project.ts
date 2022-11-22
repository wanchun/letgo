import { Project as InnerProject } from '@webank/letgo-designer';
import { RootSchema } from '@webank/letgo-types';

import { projectSymbol } from './symbols';

export class Project {
    private readonly [projectSymbol]: InnerProject;

    constructor(project: InnerProject) {
        this[projectSymbol] = project;
    }

    static create(project: InnerProject) {
        return new Project(project);
    }

    /**
     * 打开一个 document
     * @param doc
     * @returns
     */
    openDocument(doc?: string | RootSchema | undefined) {
        const documentModel = this[projectSymbol].open(doc);
        if (!documentModel) return null;
        return documentModel;
    }
}
