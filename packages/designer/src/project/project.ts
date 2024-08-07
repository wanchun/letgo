import { markComputed, markShallowReactive, uniqueId } from '@webank/letgo-common';
import { editor } from '@webank/letgo-editor-core';
import type {
    IBaseProject,
    IPublicTypeAppConfig,
    IPublicTypeAssetsJson,
    IPublicTypeComponentsMap,
    IPublicTypeProjectSchema,
    IPublicTypeRootSchema,
    IPublicTypeUtils,
} from '@webank/letgo-types';
import {
    IEnumCodeType,
    IPublicEnumTransformStage,
    isLowCodeComponentType,
    isProCodeComponentType,
} from '@webank/letgo-types';
import { EventEmitter } from 'eventemitter3';
import type { ShallowReactive } from 'vue';
import { shallowReactive } from 'vue';
import { isDocumentModel } from '../types';
import { Code } from '../code/code';
import type { Designer } from '../designer';
import { DocumentModel } from '../document';

const CodeIdCount: Record<string, number> = {};

export class Project implements IBaseProject<DocumentModel, Code> {
    id: number | string;

    css: string;

    codesInstance: Record<string, any> = {};

    utilsInstance: Record<string, any>;

    config: IPublicTypeAppConfig = {};

    private emitter = new EventEmitter();

    private data: IPublicTypeProjectSchema = {
        version: '1.0.0',
        componentsMap: [],
        componentsTree: [],
    };

    readonly code: Code;

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

    get extraGlobalState() {
        return {
            $utils: this.utilsInstance,
            $context: this.config,
        };
    }

    get utils() {
        return this.data.utils;
    }

    constructor(readonly designer: Designer, schema?: IPublicTypeProjectSchema) {
        markShallowReactive(this, {
            _currentDocument: null,
            codesInstance: {},
            utilsInstance: {},
            css: '',
            config: {},
            id: '',
        });
        markComputed(this, ['extraGlobalState']);
        this.code = new Code(this);
        this.importSchema(schema);
    }

    genCodeId = (type: IEnumCodeType | 'variable' | 'folder'): string => {
        if (type === IEnumCodeType.TEMPORARY_STATE)
            type = 'variable';

        CodeIdCount[type] = (CodeIdCount[type] || 0) + 1;
        const newId = `${type}${CodeIdCount[type]}`;
        const doc = this.currentDocument;
        if (this.code.hasCodeId(newId) || (doc?.code.hasCodeId(newId)))
            return this.genCodeId(type);

        return newId;
    };

    updateUtilsInstance(utils: Record<string, any>) {
        this.utilsInstance = utils;
    }

    updateGlobalCodesInstance(codesInstance: Record<string, any>) {
        this.codesInstance = {
            ...codesInstance,
        };
    }

    setUtils(utils: IPublicTypeUtils) {
        this.data.utils = utils;
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
            ...this.data,
            componentsMap: [],
            componentsTree: [],
            ...schema,
        };
        this.config = schema?.config || this.config;
        this.css = schema?.css;
        this.id = schema?.id || uniqueId('project');
        this.code.initCode(schema?.code);

        // TODO: 可以不用都初始化，导出时想办法用documents和componentsTree合并
        const documentInstances = this.data.componentsTree.map(data =>
            this.createDocument(data),
        );

        if (autoOpen) {
            if (autoOpen === true) {
                // auto open first document or open a blank page
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
            packages: (editor.get('assets') as IPublicTypeAssetsJson)?.packages,
            config: this.config,
        };
    }

    openDocument(doc?: string | DocumentModel | IPublicTypeRootSchema): DocumentModel | null {
        if (typeof doc === 'string') {
            let got = this.documents.find(
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
                got = this.createDocument(data);
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
            | 'code'
            | 'id'
            | string,
        value: any,
    ): void {
        if (key === 'config') {
            this.config = value;
            this.emitter.emit('config.change', value);
        }
        else if (key === 'css') {
            this.css = value;
            this.emitter.emit('global.css.change', this);
        }
        else if (key === 'code') {
            this.code.initCode(value);
        }
        else if (key === 'id') {
            this.id = value;
        }

        Object.assign(this.data, { [key]: value });
    }

    onConfigChange(fn: (config: IPublicTypeAppConfig) => void) {
        this.emitter.on('config.change', fn);
        return () => {
            this.emitter.off('config.change', fn);
        };
    }

    onCssChange(fn: (doc: DocumentModel) => void): () => void {
        this.emitter.on('global.css.change', fn);
        return () => {
            this.emitter.off('global.css.change', fn);
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
            | 'config'
            | 'code'
            | string,
    ): any {
        if (key === 'config')
            return this.config;
        if (key === 'css')
            return this.css;
        if (key === 'code')
            return this.code;

        return Reflect.get(this.data, key);
    }

    onCurrentDocumentChange(fn: (doc: DocumentModel) => void): () => void {
        this.emitter.on('current-document.change', fn);
        return () => {
            this.emitter.off('current-document.change', fn);
        };
    }

    purge() {
        // 只清掉要换的部分
        this._currentDocument = null;
        this.codesInstance = {};
        this.utilsInstance = {};
        this.config = {};
        this.css = '';
        this.id = '';
        // 先注释，避免多实例问题
        // this.emitter.removeAllListeners();
        this.code.purge();
        if (this.documents.length) {
            for (let i = this.documents.length - 1; i >= 0; i--)
                this.documents[i].remove();
        }
    }
}
