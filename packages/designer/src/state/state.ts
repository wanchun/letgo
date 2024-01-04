import { markReactive, traverseNodeSchema } from '@webank/letgo-common';
import { debounce } from 'lodash-es';
import type { IPublicModelState, IPublicTypeComponentRecord, IPublicTypeNodeData, IPublicTypeRootSchema } from '@webank/letgo-types';
import type { Designer } from '../designer';
import type { Project } from '../project';

export class State implements IPublicModelState {
    private designer: Designer;
    private nodeIdToRef = new Map<string, string>();
    private offEvents: (() => void)[] = [];
    componentsInstance: Record<string, any>;
    codesInstance: Record<string, any>;

    constructor(project: Project, schema?: IPublicTypeRootSchema) {
        markReactive(this, {
            codesInstance: {},
            componentsInstance: {},
        });
        this.designer = project.designer;

        if (schema?.children) {
            traverseNodeSchema(schema.children, (item) => {
                this.componentsInstance[item.ref] = {};
            });
        }

        this.initComponentInstanceListen();

        this.initCodesInstanceListen();
    }

    hasStateId(id: string) {
        return this.codesInstance[id] || this.componentsInstance[id];
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
                this.designer.simulator.onUpdateCodesInstance((codesInstance) => {
                    this.codesInstance = { ...codesInstance };
                }),
            );
        });
    }

    getInstance(instances: IPublicTypeComponentRecord[]) {
        return this.designer.simulator.getComponentInstancesExpose(instances[0]);
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
                docId: string
                id: string
                instances: IPublicTypeComponentRecord[]
            }) => {
                const currentDocument = this.designer.currentDocument;
                const node = currentDocument.getNode(options.id);

                if (node) {
                    if (node.id === 'root')
                        return;
                    let offEvent: () => void;
                    const clearInstance = () => {
                        if (offEvent)
                            offEvent();

                        delete this.componentsInstance[node.ref];
                    };
                    if (!options.instances || options.instances.length === 0 || options.instances.length > 1) {
                        clearInstance();
                    }
                    else if (options.instances.length > 1) {
                        // TODO 暂不支持多个实例
                        console.warn('暂不支持多个实例');
                        clearInstance();
                    }
                    else {
                        this.nodeIdToRef.set(options.id, node.ref);
                        const instance = this.getInstance(options.instances);
                        if (instance) {
                            instance._componentName = node.componentName;
                            this.componentsInstance[node.ref] = instance;
                            const listen = debounce(() => setTimeout(() => {
                                const currentInstance = this.getInstance(options.instances);
                                if (this.componentsInstance[node.ref] && currentInstance)
                                    Object.assign(this.componentsInstance[node.ref], currentInstance);
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
                        delete this.componentsInstance[refName];
                }
            }));
        });
    }

    purge() {
        this.offEvents.forEach(fn => fn());
    }
}
