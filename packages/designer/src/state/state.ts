/**
 * model 状态管理
 * 全局状态
 * code 实例
 * component 实例
 * TODO utils key 校验
 */
import type { IPublicTypeAppConfig } from '@webank/letgo-types';
import { markReactive } from '@webank/letgo-common';
import { debounce } from 'lodash-es';
import type { Designer } from '../designer';
import type { IComponentInstance } from '../types';
import type { Project } from '../project';

export class State {
    private designer: Designer;
    private config: IPublicTypeAppConfig;
    private nodeIdToRef = new Map<string, string>();
    componentsInstance: Record<string, any>;
    codesInstance: Record<string, any>;
    constructor(project: Project) {
        markReactive(this, {
            codesInstance: {},
            componentsInstance: {},
        });
        this.designer = project.designer;
        this.config = project.config;

        this.initComponentInstanceListen();

        this.initCodesInstanceListen();
    }

    get globalState() {
        return this.config;
    }

    initCodesInstanceListen() {
        this.designer.onSimulatorReady(() => {
            this.designer.simulator.onUpdateCodesInstance((codesInstance) => {
                this.codesInstance = { ...codesInstance };
            });
        });
    }

    getInstance(instances: IComponentInstance[]) {
        return this.designer.simulator.getComponentInstancesExpose(instances[0]);
    }

    initComponentInstanceListen() {
        // TODO: 清理
        this.designer.onSimulatorReady(() => {
            this.designer.simulator.onEvent('componentInstanceChange', (options: {
                docId: string
                id: string
                instances: IComponentInstance[]
            }) => {
                const currentDocument = this.designer.currentDocument;
                const node = currentDocument.getNode(options.id);

                if (node) {
                    if (node.id === 'root')
                        return;
                    const refName = node.ref;
                    let offEvent: () => void;
                    const clearInstance = () => {
                        if (offEvent)
                            offEvent();

                        delete this.componentsInstance[refName];
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
                            this.componentsInstance[refName] = instance;
                            const listen = debounce(() => setTimeout(() => {
                                const currentInstance = this.getInstance(options.instances);
                                if (this.componentsInstance[refName] && currentInstance)
                                    Object.assign(this.componentsInstance[refName], currentInstance);
                            }, 50), 100);
                            offEvent = node.onPropChange(() => {
                                if (!this.componentsInstance[refName])
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
            });
        });
    }
}
