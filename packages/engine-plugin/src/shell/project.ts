import type { Project as InnerProject } from '@webank/letgo-designer';
import type { IPublicTypeProjectSchema, IPublicTypeRootSchema } from '@webank/letgo-types';
import { IPublicEnumTransformStage } from '@webank/letgo-types';

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
    openDocument(doc?: string | IPublicTypeRootSchema | undefined) {
        const documentModel = this[projectSymbol].open(doc);
        if (!documentModel)
            return null;
        return documentModel;
    }

    getSchema(stage: IPublicEnumTransformStage = IPublicEnumTransformStage.Save): IPublicTypeProjectSchema {
        return this[projectSymbol].getSchema(stage);
    }
}
