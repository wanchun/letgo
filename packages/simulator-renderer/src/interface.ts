import { Router } from 'vue-router';
import { Config } from '@webank/letgo-renderer';
import { Component, App } from 'vue';
import {
    IPublicTypeComponentSchema,
    IPublicTypeNpmInfo,
    IPublicTypeRootSchema,
    IPublicTypeComponentInstance,
} from '@webank/letgo-types';
import {
    ISimulatorRenderer,
    DocumentModel,
    Node,
} from '@webank/letgo-designer';

export type MixedComponent = IPublicTypeNpmInfo | Component | IPublicTypeComponentSchema;

export interface SimulatorViewLayout {
    Component?: Component;
    componentName?: string;
    props?: Record<string, unknown>;
}

export interface VueSimulatorRenderer extends ISimulatorRenderer {
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
    dispose(): void;
    rerender(): void;
    getCurrentDocument(): DocumentInstance | undefined;
}

export interface DocumentInstance {
    readonly id: string;
    readonly key: string;
    readonly path: string;
    readonly document: DocumentModel;
    readonly instancesMap: Map<string, IPublicTypeComponentInstance[]>;
    readonly schema: IPublicTypeRootSchema;
    getComponentInstance(id: number): IPublicTypeComponentInstance | null;
    mountInstance(id: string, instance: IPublicTypeComponentInstance): (() => void) | void;
    unmountInstance(id: string, instance: IPublicTypeComponentInstance): void;
    rerender(): void;
    getNode(id: string): Node | null;
}
