import type { DocumentModel, Project as InnerProject } from '@harrywan/letgo-designer';
import type { IPublicTypeProjectSchema, IPublicTypeRootSchema, IPublicTypeUtilsMap } from '@harrywan/letgo-types';
import { IPublicEnumTransformStage } from '@harrywan/letgo-types';

import { projectSymbol } from './symbols';

export class Project {
    private readonly [projectSymbol]: InnerProject;

    get currentDocument(): DocumentModel | null {
        return this[projectSymbol].currentDocument;
    }

    constructor(project: InnerProject) {
        this[projectSymbol] = project;
    }

    static create(project: InnerProject) {
        return new Project(project);
    }

    setUtils(utils: IPublicTypeUtilsMap) {
        this[projectSymbol].setUtils(utils);
    }

    /**
     * 打开一个 document
     * @param doc
     * @returns
     */
    openDocument(doc?: string | IPublicTypeRootSchema | undefined) {
        const documentModel = this[projectSymbol].openDocument(doc);
        if (!documentModel)
            return null;
        return documentModel;
    }

    importSchema(schema?: IPublicTypeProjectSchema, autoOpen?: boolean | string) {
        return this[projectSymbol].importSchema(schema, autoOpen);
    }

    exportSchema(stage: IPublicEnumTransformStage = IPublicEnumTransformStage.Save): IPublicTypeProjectSchema {
        return this[projectSymbol].exportSchema(stage);
    }
}
