import { getConvertedExtraKey, markReactive, markShallowReactive, traverseNodeSchema } from '@webank/letgo-common';
import { debounce } from 'lodash-es';
import type { IPublicModelState, IPublicTypeComponentRecord, IPublicTypeRootSchema } from '@webank/letgo-types';
import type { Designer } from '../designer';
import type { INode } from '../types';
import type { DocumentModel } from '../document/document-model';

export class State implements IPublicModelState {
    private designer: Designer;
    private nodeIdToRef = new Map<string, string>();
    private offEvents: (() => void)[] = [];
    props: Record<string, any>;
    componentsInstance: Record<string, any>;
    codesInstance: Record<string, any>;
    classInstance: Record<string, any>;

    constructor(docModal: DocumentModel, schema?: IPublicTypeRootSchema) {
        markReactive(this, {
            props: {},
        });
        markShallowReactive(this, {
            componentsInstance: {},
            codesInstance: {},
        });
        this.designer = docModal.designer;

        if (schema?.children) {
            traverseNodeSchema(schema.children, (item) => {
                if (item.loop)
                    this.componentsInstance[item.ref] = [];

                else
                    this.componentsInstance[item.ref] = {};
            });
        }

        this.initComponentInstanceListen();

        this.initCodesInstanceListen();
    }

    init(root: INode) {
        if (root.componentName === 'Component')
            this.initRootProps(root);
    }

    private initRootProps(root: INode) {
        this.props = root.getExtraProp('defaultProps').getValue() as Record<string, any>;
        root.onPropChange(debounce((info) => {
            const { prop } = info;
            const rootPropKey: string = prop.path[0];
            if (rootPropKey === getConvertedExtraKey('defaultProps'))
                this.props = root.getExtraProp('defaultProps').getValue() as Record<string, any>;
        }, 300));
    }

    hasStateId(id: string) {
        return !!(this.codesInstance[id] || this.componentsInstance[id]);
    }

    triggerAfterSimulatorReady(fn: () => void) {
        if (this.designer.simulator) {
            fn();
        }
        else {
            this.offEvents.push(this.designer.onSimulatorReady(() => {
                fn();
            }));
        }
    }

    initCodesInstanceListen() {
        this.triggerAfterSimulatorReady(() => {
            this.offEvents.push(
                this.designer.simulator.onUpdateCodesInstance(({ __this, ...codesInstance }) => {
                    this.codesInstance = codesInstance;
                    this.classInstance = __this;
                }),
            );
        });
    }

    getInstances(instances: IPublicTypeComponentRecord[]) {
        return instances.map((item) => {
            return this.designer.simulator.getComponentInstancesExpose(item);
        }).filter(Boolean);
    }

    getCompScope(ref: string) {
        const instances = this.componentsInstance[ref];
        if (Array.isArray(instances))
            return instances.length > 0 ? instances[0].__scope : null;

        return instances ? instances.__scope : null;
    }

    private setCompInstances(node: INode, instances: Record<string, any>) {
        const prop = node.props.getExtraProp('loop', false);
        if (prop && prop.getValue()) {
            this.componentsInstance[node.ref] = instances;
        }
        else {
            instances[0].__componentName = node.componentName;
            this.componentsInstance[node.ref] = instances[0];
        }
    }

    changeNodeRef(ref: string, preRef: string) {
        this.nodeIdToRef.forEach((currentRef, id) => {
            if (currentRef === preRef)
                this.nodeIdToRef.set(id, ref);
        });
        this.componentsInstance[ref] = this.componentsInstance[preRef];
        delete this.componentsInstance[preRef];
    }

    initComponentInstanceListen() {
        this.triggerAfterSimulatorReady(() => {
            this.offEvents.push(this.designer.simulator.onEvent('componentInstanceChange', (options: {
                docId: string;
                id: string;
                instances: IPublicTypeComponentRecord[];
            }) => {
                const currentDocument = this.designer.project.getDocumentById(options.docId);
                if (!currentDocument)
                    return;

                const node = currentDocument.getNode(options.id);

                if (node) {
                    if (node.id === 'root')
                        return;
                    let offEvent: () => void;
                    const clearInstance = () => {
                        if (offEvent)
                            offEvent();

                        this.componentsInstance[node.ref] = {};
                    };
                    if (!options.instances || options.instances.length === 0) {
                        clearInstance();
                    }
                    else {
                        this.nodeIdToRef.set(options.id, node.ref);
                        const instances = this.getInstances(options.instances);
                        if (instances.length) {
                            this.setCompInstances(node, instances);

                            const listen = debounce(() => setTimeout(() => {
                                const currentInstances = this.getInstances(options.instances);
                                if (this.componentsInstance[node.ref] && currentInstances.length)
                                    this.setCompInstances(node, currentInstances);
                            }, 50), 100);

                            offEvent = node.onPropChange(() => {
                                if (!this.componentsInstance[node.ref])
                                    offEvent();

                                else
                                    listen();
                            });
                        }
                        else {
                            clearInstance();
                        }
                    }
                }
                else {
                    const refName = this.nodeIdToRef.get(options.id);
                    if (refName)
                        this.componentsInstance[refName] = {};
                }
            }));
        });
    }

    purge() {
        this.props = {};
        this.componentsInstance = {};
        this.codesInstance = {};
        this.classInstance = {};
        this.offEvents.forEach(fn => fn());
    }
}
