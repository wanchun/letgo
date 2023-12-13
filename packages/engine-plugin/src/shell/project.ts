import type { DocumentModel, Project as InnerProject } from '@webank/letgo-designer';
import type {
    IPublicTypeAppConfig,
    IPublicTypeIconSchema,
    IPublicTypeProjectSchema,
    IPublicTypeRootSchema,
    IPublicTypeUtilsMap,
} from '@webank/letgo-types';
import { IPublicEnumTransformStage } from '@webank/letgo-types';

import { projectSymbol } from './symbols';

export class Project {
    static create(project: InnerProject) {
        return new Project(project);
    }

    private readonly [projectSymbol]: InnerProject;

    get currentDocument(): DocumentModel | null {
        return this[projectSymbol].currentDocument;
    }

    constructor(project: InnerProject) {
        this[projectSymbol] = project;
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

    setConfig(value: IPublicTypeAppConfig) {
        this[projectSymbol].set('config', value);
    }

    getConfig() {
        return this[projectSymbol].config;
    }

    setUtils(utils: IPublicTypeUtilsMap) {
        this[projectSymbol].setUtils(utils);
    }

    setIcons(icons: IPublicTypeIconSchema[]) {
        this[projectSymbol].setIcons(icons);
    }
}
