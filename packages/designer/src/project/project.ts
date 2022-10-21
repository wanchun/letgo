import { EventEmitter } from 'events';
import { shallowRef, ShallowRef, watchEffect } from 'vue';
import {
    ProjectSchema,
    RootSchema,
    TransformStage,
    ComponentsMap,
    isProCodeComponentType,
    isLowCodeComponentType,
} from '@webank/letgo-types';
import { isDocumentModel } from '../types';
import { Designer } from '../designer';
import { DocumentModel } from '../document';

export class Project {
    private emitter = new EventEmitter();

    private data: ProjectSchema = {
        version: '1.0.0',
        componentsMap: [],
        componentsTree: [],
    };

    private _config: any = {};

    readonly documentsMap = new Map<string, DocumentModel>();

    readonly documents: DocumentModel[] = [];

    currentDocument: ShallowRef<DocumentModel | null> = shallowRef(null);

    get config(): any {
        // TODO: parse layout Component
        return this._config;
    }

    set config(value: any) {
        this._config = value;
    }

    constructor(readonly designer: Designer, schema?: ProjectSchema) {
        watchEffect(() => {
            this.emitter.emit('current-document.change', this.currentDocument);
        });
        this.load(schema);
    }

    private getComponentsMap(): ComponentsMap {
        return this.documents.reduce(
            (componentsMap: ComponentsMap, curDoc: DocumentModel) => {
                const curComponentsMap = curDoc.getComponentsMap();
                if (Array.isArray(curComponentsMap)) {
                    curComponentsMap.forEach((item) => {
                        const found = componentsMap.find((eItem) => {
                            if (
                                isProCodeComponentType(eItem) &&
                                isProCodeComponentType(item) &&
                                eItem.package === item.package &&
                                eItem.componentName === item.componentName
                            ) {
                                return true;
                            } else if (
                                isLowCodeComponentType(eItem) &&
                                eItem.componentName === item.componentName
                            ) {
                                return true;
                            }
                            return false;
                        });
                        if (found) return;
                        componentsMap.push(item);
                    });
                }
                return componentsMap;
            },
            [] as ComponentsMap,
        );
    }

    /**
     * 获取项目整体 schema
     */
    getSchema(stage: TransformStage = TransformStage.Save): ProjectSchema {
        return {
            ...this.data,
            componentsMap: this.getComponentsMap(),
            componentsTree: this.documents
                .filter((doc) => !doc.isBlank())
                .map((doc) => doc.export(stage)),
        };
    }

    load(schema?: ProjectSchema, autoOpen?: boolean | string) {
        this.unload();
        // load new document
        this.data = {
            version: '1.0.0',
            componentsMap: [],
            componentsTree: [],
            ...schema,
        };
        this.config = schema?.config || this.config;

        if (autoOpen) {
            if (autoOpen === true) {
                // auto open first document or open a blank page
                // this.open(this.data.componentsTree[0]);
                const documentInstances = this.data.componentsTree.map((data) =>
                    this.createDocument(data),
                );
                this.open(documentInstances[0]);
            } else {
                // auto open should be string of fileName
                this.open(autoOpen);
            }
        }
    }

    /**
     * 卸载当前项目数据
     */
    unload() {
        if (this.documents.length < 1) {
            return;
        }
        for (let i = this.documents.length - 1; i >= 0; i--) {
            this.documents[i].remove();
        }
    }

    open(doc?: string | DocumentModel | RootSchema): DocumentModel | null {
        if (typeof doc === 'string') {
            const got = this.documents.find(
                (item) => item.fileName === doc || item.id === doc,
            );
            if (got) {
                this.currentDocument.value = got;
                return got;
            }

            const data = this.data.componentsTree.find(
                (data) => data.fileName === doc,
            );
            if (data) {
                doc = this.createDocument(data);
                this.currentDocument.value = got;
                return got;
            }
            return null;
        }
        if (isDocumentModel(doc)) {
            this.currentDocument.value = doc;
            return doc;
        }

        doc = this.createDocument(doc);
        this.currentDocument.value = doc;
        return doc;
    }

    createDocument(data?: RootSchema): DocumentModel {
        const doc = new DocumentModel(
            this,
            data || this?.data?.componentsTree?.[0],
        );
        this.documents.push(doc);
        this.documentsMap.set(doc.id, doc);
        return doc;
    }

    removeDocument(doc: DocumentModel) {
        const index = this.documents.indexOf(doc);
        if (index < 0) {
            return;
        }
        this.documents.splice(index, 1);
        this.documentsMap.delete(doc.id);
    }

    findDocument(id: string): DocumentModel | null {
        // 此处不能使用 this.documentsMap.get(id)，因为在乐高 rollback 场景，document.id 会被改成其他值
        return this.documents.find((doc) => doc.id === id) || null;
    }

    /**
     * 分字段设置储存数据，不记录操作记录
     */
    set(
        key:
            | 'version'
            | 'componentsTree'
            | 'componentsMap'
            | 'utils'
            | 'constants'
            | 'i18n'
            | 'css'
            | 'dataSource'
            | string,
        value: any,
    ): void {
        if (key === 'config') {
            this.config = value;
        }
        Object.assign(this.data, { [key]: value });
    }

    /**
     * 分字段设置储存数据
     */
    get(
        key:
            | 'version'
            | 'componentsTree'
            | 'componentsMap'
            | 'utils'
            | 'constants'
            | 'i18n'
            | 'css'
            | 'dataSource'
            | 'config'
            | string,
    ): any {
        if (key === 'config') {
            return this.config;
        }
        return Reflect.get(this.data, key);
    }

    onCurrentDocumentChange(fn: (doc: DocumentModel) => void): () => void {
        this.emitter.on('current-document.change', fn);
        return () => {
            this.emitter.removeListener('current-document.change', fn);
        };
    }
}
