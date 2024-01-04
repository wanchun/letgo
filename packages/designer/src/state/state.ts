import { markReactive, markShallowReactive, traverseNodeSchema } from '@webank/letgo-common';
import { debounce } from 'lodash-es';
import type { IPublicModelState, IPublicTypeComponentRecord, IPublicTypeRootSchema } from '@webank/letgo-types';
import type { Designer } from '../designer';
import type { Project } from '../project';
import type { INode } from '../types';

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
        markShallowReactive(this, {

        });
        this.designer = project.designer;

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

    getInstances(instances: IPublicTypeComponentRecord[]) {
        return instances.map((item) => {
            return this.designer.simulator.getComponentInstancesExpose(item);
        });
    }

    private setCompInstances(node: INode, instances: Record<string, any>) {
        const prop = node.props.getExtraProp('loop', false);
        if (prop && prop.getValue()) {
            this.componentsInstance[node.ref] = instances;
        }
        else {
            instances[0]._componentName = node.componentName;
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
                        delete this.componentsInstance[refName];
                }
            }));
        });
    }

    purge() {
        this.offEvents.forEach(fn => fn());
    }
}
