import { EventEmitter } from 'eventemitter3';
import type { ShallowRef } from 'vue';
import { shallowRef, watch } from 'vue';
import type {
    IPublicTypeComponentsMap,
    IPublicTypeProjectSchema,
    IPublicTypeRootSchema,
} from '@webank/letgo-types';
import {
    IPublicEnumTransformStage,
    isLowCodeComponentType,
    isProCodeComponentType,
} from '@webank/letgo-types';
import { isDocumentModel } from '../types';
import type { Designer } from '../designer';
import { DocumentModel } from '../document';

export class Project {
    private emitter = new EventEmitter();

    private data: IPublicTypeProjectSchema = {
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

    constructor(readonly designer: Designer, schema?: IPublicTypeProjectSchema) {
        watch(this.currentDocument, () => {
            this.emitter.emit('current-document.change', this.currentDocument);
        });
        this.load(schema);
    }

    private getComponentsMap(): IPublicTypeComponentsMap {
        return this.documents.reduce(
            (componentsMap: IPublicTypeComponentsMap, curDoc: DocumentModel) => {
                const curComponentsMap = curDoc.getComponentsMap();
                if (Array.isArray(curComponentsMap)) {
                    curComponentsMap.forEach((item) => {
                        const found = componentsMap.find((eItem) => {
                            if (
                                isProCodeComponentType(eItem)
                                && isProCodeComponentType(item)
                                && eItem.package === item.package
                                && eItem.componentName === item.componentName
                            )
                                return true;

                            else if (
                                isLowCodeComponentType(eItem)
                                && eItem.componentName === item.componentName
                            )
                                return true;

                            return false;
                        });
                        if (found)
                            return;
                        componentsMap.push(item);
                    });
                }
                return componentsMap;
            },
            [] as IPublicTypeComponentsMap,
        );
    }

    /**
     * 获取项目整体 schema
     */
    getSchema(stage: IPublicEnumTransformStage = IPublicEnumTransformStage.Save): IPublicTypeProjectSchema {
        return {
            ...this.data,
            componentsMap: this.getComponentsMap(),
            componentsTree: this.documents.map(doc => doc.export(stage)),
        };
    }

    load(schema?: IPublicTypeProjectSchema, autoOpen?: boolean | string) {
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
                const documentInstances = this.data.componentsTree.map(data =>
                    this.createDocument(data),
                );
                this.open(documentInstances[0]);
            }
            else {
                // auto open should be string of fileName
                this.open(autoOpen);
            }
        }
    }

    /**
     * 卸载当前项目数据
     */
    unload() {
        if (this.documents.length < 1)
            return;

        for (let i = this.documents.length - 1; i >= 0; i--)
            this.documents[i].remove();
    }

    open(doc?: string | DocumentModel | IPublicTypeRootSchema): DocumentModel | null {
        if (typeof doc === 'string') {
            const got = this.documents.find(
                item => item.fileName === doc || item.id === doc,
            );
            if (got) {
                this.currentDocument.value = got;
                return got;
            }

            const data = this.data.componentsTree.find(
                data => data.fileName === doc,
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

    createDocument(data?: IPublicTypeRootSchema): DocumentModel {
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
        if (index < 0)
            return;

        this.documents.splice(index, 1);
        this.documentsMap.delete(doc.id);
    }

    findDocument(id: string): DocumentModel | null {
        // 此处不能使用 this.documentsMap.get(id)，因为在乐高 rollback 场景，document.id 会被改成其他值
        return this.documents.find(doc => doc.id === id) || null;
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
        if (key === 'config')
            this.config = value;

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
        if (key === 'config')
            return this.config;

        return Reflect.get(this.data, key);
    }

    onCurrentDocumentChange(fn: (doc: DocumentModel) => void): () => void {
        this.emitter.on('current-document.change', fn);
        return () => {
            this.emitter.off('current-document.change', fn);
        };
    }
}
