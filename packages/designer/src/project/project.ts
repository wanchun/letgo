import { EventEmitter } from 'eventemitter3';
import type { ShallowReactive } from 'vue';
import { shallowReactive } from 'vue';
import type {
    IPublicTypeAppConfig,
    IPublicTypeComponentsMap,
    IPublicTypeProjectSchema,
    IPublicTypeRootSchema,
} from '@webank/letgo-types';
import {
    IPublicEnumTransformStage,
    isLowCodeComponentType,
    isProCodeComponentType,
} from '@webank/letgo-types';
import { markComputed, markShallowReactive } from '@webank/letgo-common';
import { isDocumentModel } from '../types';
import type { Designer } from '../designer';
import { DocumentModel } from '../document';
import { Code } from '../code/code';

export class Project {
    css: string;
    codesInstance: Record<string, any> = {};
    private emitter = new EventEmitter();
    readonly code: Code;

    private data: IPublicTypeProjectSchema = {
        version: '1.0.0',
        componentsMap: [],
        componentsTree: [],
    };

    private _config: IPublicTypeAppConfig = {};

    readonly documentsMap = new Map<string, DocumentModel>();

    readonly documents: ShallowReactive< DocumentModel[]> = shallowReactive([]);

    private _currentDocument: DocumentModel | null;

    get currentDocument(): DocumentModel | null {
        return this._currentDocument;
    }

    /**
     * 【响应式】获取 schema 数据
     */
    get computedSchema() {
        return this.exportSchema();
    }

    get config(): IPublicTypeAppConfig {
        // TODO: parse layout Component
        return this._config;
    }

    set config(value: IPublicTypeAppConfig) {
        this._config = value;
    }

    constructor(readonly designer: Designer, schema?: IPublicTypeProjectSchema) {
        markShallowReactive(this, {
            _currentDocument: null,
            codesInstance: {},
            css: '',
        });
        markComputed(this, ['currentDocument']);
        this.code = new Code();
        this.importSchema(schema);
    }

    updateGlobalCodesInstance(codesInstance: Record<string, any>) {
        this.codesInstance = {
            ...codesInstance,
        };
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
                                && eItem.exportName === item.exportName
                            )
                                return true;

                            else if (
                                isLowCodeComponentType(eItem)
                                && isLowCodeComponentType(item)
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

    importSchema(schema?: IPublicTypeProjectSchema, autoOpen?: boolean | string) {
        this.purge();
        // importSchema new document
        this.data = {
            version: '1.0.0',
            componentsMap: [],
            componentsTree: [],
            ...schema,
        };
        this.config = schema?.config || this.config;
        this.css = schema?.css;
        this.code.initCode(schema?.code);

        if (autoOpen) {
            if (autoOpen === true) {
                // auto open first document or open a blank page
                // this.openDocument(this.data.componentsTree[0]);
                const documentInstances = this.data.componentsTree.map(data =>
                    this.createDocument(data),
                );
                this.openDocument(documentInstances[0]);
            }
            else {
                // auto open should be string of fileName
                this.openDocument(autoOpen);
            }
        }
    }

    exportSchema(stage: IPublicEnumTransformStage = IPublicEnumTransformStage.Save): IPublicTypeProjectSchema {
        return {
            ...this.data,
            css: this.css,
            code: this.code.codeStruct,
            componentsMap: this.getComponentsMap(),
            componentsTree: this.documents.map(doc => doc.exportSchema(stage)),
        };
    }

    openDocument(doc?: string | DocumentModel | IPublicTypeRootSchema): DocumentModel | null {
        if (typeof doc === 'string') {
            const got = this.documents.find(
                item => item.fileName === doc || item.id === doc,
            );
            if (got) {
                this._currentDocument = got;
                this.emitter.emit('current-document.change', this._currentDocument);
                return got;
            }

            const data = this.data.componentsTree.find(
                data => data.fileName === doc,
            );
            if (data) {
                doc = this.createDocument(data);
                this._currentDocument = got;
                this.emitter.emit('current-document.change', this._currentDocument);
                return got;
            }
            return null;
        }
        if (isDocumentModel(doc)) {
            this._currentDocument = doc;
            this.emitter.emit('current-document.change', this._currentDocument);
            return doc;
        }
        doc = this.createDocument(doc);
        this._currentDocument = doc;
        this.emitter.emit('current-document.change', this._currentDocument);
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

    getDocumentByFileName(name: string): DocumentModel | null {
        return this.documents.find(doc => doc.fileName === name) || null;
    }

    getDocumentById(id: string): DocumentModel | null {
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
        if (key === 'config') {
            this.config = value;
        }
        else if (key === 'css') {
            this.css = value;
            this.emitter.emit('onCssChange', this);
        }

        Object.assign(this.data, { [key]: value });
    }

    onCssChange(fn: (doc: DocumentModel) => void): () => void {
        this.emitter.on('onCssChange', fn);
        return () => {
            this.emitter.off('onCssChange', fn);
        };
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
        if (key === 'css')
            return this.css;

        return Reflect.get(this.data, key);
    }

    onCurrentDocumentChange(fn: (doc: DocumentModel) => void): () => void {
        this.emitter.on('current-document.change', fn);
        return () => {
            this.emitter.off('current-document.change', fn);
        };
    }

    purge() {
        if (this.documents.length < 1)
            return;

        for (let i = this.documents.length - 1; i >= 0; i--)
            this.documents[i].remove();
    }
}
