import type { Router } from 'vue-router';
import type { Config } from '@webank/letgo-renderer';
import type { App, Component } from 'vue';
import type {
    IPublicTypeComponentInstance,
    IPublicTypeComponentSchema,
    IPublicTypeNpmInfo,
    IPublicTypeRootSchema,
    IPublicTypeSimulatorRenderer,
} from '@webank/letgo-types';
import type {
    DocumentModel,
    INode,
} from '@webank/letgo-designer';

export type MixedComponent = IPublicTypeNpmInfo | Component | IPublicTypeComponentSchema;

export interface SimulatorViewLayout {
    Component?: Component;
    componentName?: string;
    props?: Record<string, unknown>;
}

export interface VueSimulatorRenderer extends IPublicTypeSimulatorRenderer<INode> {
    app: App;
    config: Config;
    router: Router;
    layout: SimulatorViewLayout;
    device: string;
    locale: string;
    designMode: 'design';
    libraryMap: Record<string, string>;
    components: Record<string, Component>;
    autoRender: boolean;
    componentsMap: Record<string, MixedComponent>;
    documentInstances: DocumentInstance[];
    dispose: () => void;
    rerender: () => void;
    getCurrentDocument: () => DocumentInstance | undefined;
    initDocument: () => void;
    libraryUpdate: number;
}

export interface DocumentInstance {
    readonly id: string;
    readonly key: string;
    readonly path: string;
    readonly document: DocumentModel;
    readonly instancesMap: Map<string, IPublicTypeComponentInstance[]>;
    readonly vueInstanceMap: Map<number, IPublicTypeComponentInstance>;
    readonly defaultProps: Record<string, any>;
    readonly schema: IPublicTypeRootSchema;
    getComponentInstance: (id: number) => IPublicTypeComponentInstance | null;
    mountInstance: (id: string, instance: IPublicTypeComponentInstance) => (() => void) | void;
    unmountInstance: (id: string, instance: IPublicTypeComponentInstance) => void;
    rerender: () => void;
    getNode: (id: string) => INode | null;
}
