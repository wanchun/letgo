/**
 * model 状态管理
 * 全局状态
 * code 实例
 * component 实例
 * TODO utils key 校验
 */
import type { IPublicTypeAppConfig } from '@webank/letgo-types';
import { markReactive } from '@webank/letgo-utils';
import type { Designer } from '../designer';
import type { IComponentInstance } from '../types';
import type { Project } from '../project';

export class State {
    private designer: Designer;
    private config: IPublicTypeAppConfig;
    private nodeIdToRef = new Map<string, string>();
    componentsInstance: Record<string, any>;
    constructor(project: Project) {
        markReactive(this, {
            componentsInstance: {},
        });
        this.designer = project.designer;
        this.config = project.config;

        this.initComponentInstanceListen();
    }

    get globalState() {
        return this.config;
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
                    if (!options.instances || options.instances.length === 0 || options.instances.length > 1) {
                        delete this.componentsInstance[refName];
                    }
                    else if (options.instances.length > 1) {
                        // TODO 暂不支持多个实例
                        console.warn('暂不支持多个实例');
                        delete this.componentsInstance[refName];
                    }
                    else {
                        this.nodeIdToRef.set(options.id, node.ref);
                        this.componentsInstance[refName] = this.designer.simulator.getComponentInstancesExpose(options.instances[0]);
                        node.onPropChange((param) => {
                            this.componentsInstance[refName][param.key] = param.newValue;
                        });
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
