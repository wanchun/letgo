import { shallowRef, ShallowRef, watchEffect } from 'vue';
import { EventEmitter } from 'events';
import { ProjectSchema, RootSchema } from '@webank/letgo-types';
import { ISimulator, isDocument } from '../types';
import { Designer } from '../designer';
import { Document } from '../document';

export class Project {
    private emitter = new EventEmitter();

    private data: ProjectSchema = {
        version: '1.0.0',
        componentsMap: [],
        componentsTree: [],
    };

    private _simulator?: ISimulator;

    private documentsMap = new Map<string, Document>();

    private documents: Document[] = [];

    private _config: any = {};

    currentDocument: ShallowRef<Document | null> = shallowRef();
    /**
     * 模拟器
     */
    get simulator(): ISimulator | null {
        return this._simulator || null;
    }

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

    open(doc: string | Document | RootSchema): Document | null {
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
        if (isDocument(doc)) {
            this.currentDocument.value = doc;
            return doc;
        }

        doc = this.createDocument(doc);
        this.currentDocument.value = doc;
        return doc;
    }

    createDocument(data?: RootSchema): Document {
        const doc = new Document(this, data || this?.data?.componentsTree?.[0]);
        this.documents.push(doc);
        this.documentsMap.set(doc.id, doc);
        return doc;
    }

    removeDocument(doc: Document) {
        const index = this.documents.indexOf(doc);
        if (index < 0) {
            return;
        }
        this.documents.splice(index, 1);
        this.documentsMap.delete(doc.id);
    }

    findDocument(id: string): Document | null {
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

    onCurrentDocumentChange(fn: (doc: Document) => void): () => void {
        this.emitter.on('current-document.change', fn);
        return () => {
            this.emitter.removeListener('current-document.change', fn);
        };
    }

    private mountSimulator(simulator: ISimulator) {
        // TODO: 多设备 simulator 支持
        this._simulator = simulator;
        this.designer.editor.set('simulator', simulator);
        this.emitter.emit('letgo_engine_simulator_ready', simulator);
    }
}
