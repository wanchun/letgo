import { DocumentModel } from '@webank/letgo-designer';
import { TransformStage, ComponentInstance } from '@webank/letgo-types';
import { cursor, setNativeSelection, isElement } from '@webank/letgo-utils';
import {
    Ref,
    Component,
    createApp,
    ref,
    shallowRef,
    reactive,
    computed,
    markRaw,
    onUnmounted,
} from 'vue';
import { config } from '@webank/letgo-renderer';
import { createMemoryHistory, createRouter } from 'vue-router';
import { buildComponents, getSubComponent } from './build-components';
import {
    DocumentInstance,
    MixedComponent,
    SimulatorViewLayout,
    VueSimulatorRenderer,
} from './interface';
import { RendererView, SimulatorRendererView } from './simulator-view';
import { Slot, Leaf, Page } from './buildin-components';
import { host } from './host';
import {
    findDOMNodes,
    getClientRects,
    getCompRootData,
    setCompRootData,
    getClosestNodeInstance,
    ComponentRecord,
    isComponentRecord,
    getClosestNodeInstanceByComponent,
} from './utils';
import './simulator.css';

const builtinComponents = { Slot, Leaf, Page };

function createDocumentInstance(document: DocumentModel): DocumentInstance {
    /** 记录单个节点的组件实例列表 */
    const instancesMap = new Map<string, ComponentInstance[]>();
    /** 记录 vue 组件实例和组件 uid 的映射关系 */
    const vueInstanceMap = new Map<number, ComponentInstance>();

    const timestamp = ref(Date.now());

    const checkInstanceMounted = (instance: ComponentInstance): boolean => {
        return instance.$.isMounted;
    };

    const setHostInstance = (
        docId: string,
        nodeId: string,
        instances: ComponentInstance[] | null,
    ) => {
        const instanceRecords = !instances
            ? null
            : instances.map(
                  (inst) => new ComponentRecord(docId, nodeId, inst.$.uid),
              );
        host.setInstance(docId, nodeId, instanceRecords);
    };

    const getComponentInstance = (id: number) => {
        return vueInstanceMap.get(id);
    };

    const unmountInstance = (id: string, instance: ComponentInstance) => {
        const instances = instancesMap.get(id);
        if (instances) {
            const i = instances.indexOf(instance);
            if (i > -1) {
                const [instance] = instances.splice(i, 1);
                vueInstanceMap.delete(instance.$.uid);
                setHostInstance(document.id, id, instances);
            }
        }
    };

    const mountInstance = (id: string, instance: ComponentInstance) => {
        const docId = document.id;
        if (instance == null) {
            let instances = instancesMap.get(id);
            if (instances) {
                instances = instances.filter(checkInstanceMounted);
                if (instances.length > 0) {
                    instancesMap.set(id, instances);
                    setHostInstance(docId, id, instances);
                } else {
                    instancesMap.delete(id);
                    setHostInstance(docId, id, null);
                }
            }
            return;
        }

        const el = instance.$el;

        const origId = getCompRootData(el).nodeId;

        if (origId && origId !== id) {
            // 另外一个节点的 instance 在此被复用了，需要从原来地方卸载
            unmountInstance(origId, instance);
        }

        onUnmounted(() => unmountInstance(id, instance), instance.$);

        setCompRootData(el, {
            nodeId: id,
            docId: docId,
            instance: instance,
        });
        let instances = instancesMap.get(id);
        if (instances) {
            const l = instances.length;
            instances = instances.filter(checkInstanceMounted);
            let updated = instances.length !== l;
            if (!instances.includes(instance)) {
                instances.push(instance);
                updated = true;
            }
            if (!updated) return;
        } else {
            instances = [instance];
        }
        vueInstanceMap.set(instance.$.uid, instance);
        instancesMap.set(id, instances);
        setHostInstance(docId, id, instances);
    };

    const getNode: DocumentInstance['getNode'] = (id) => {
        return id ? document.getNode(id) : null;
    };

    return reactive({
        id: computed(() => document.id),
        path: computed(() => {
            const { fileName } = document;
            return fileName.startsWith('/') ? fileName : `/${fileName}`;
        }),
        key: computed(() => `${document.id}:${timestamp.value}`),
        schema: computed(() => document.export(TransformStage.Render)),
        document: computed(() => document),
        instancesMap: computed(() => instancesMap),
        getNode,
        mountInstance,
        unmountInstance,
        getComponentInstance,
        rerender: () => void (timestamp.value = Date.now()),
    }) as DocumentInstance;
}

function createSimulatorRenderer() {
    const layout: Ref<SimulatorViewLayout> = shallowRef({});
    const device: Ref<string> = shallowRef('default');
    const autoRender = shallowRef(host.autoRender);
    const designMode: Ref<string> = shallowRef('design');
    const libraryMap: Ref<Record<string, string>> = shallowRef({});
    const components: Ref<Record<string, Component>> = shallowRef({});
    const componentsMap: Ref<Record<string, MixedComponent>> = shallowRef({});
    const documentInstances: Ref<DocumentInstance[]> = shallowRef([]);
    const disposeFunctions: Array<() => void> = [];
    const documentInstanceMap = new Map<string, DocumentInstance>();

    const simulator = reactive({
        config: markRaw(config),
        layout,
        device,
        designMode,
        libraryMap,
        components,
        autoRender,
        componentsMap,
        documentInstances,
        isSimulatorRenderer: true,
    }) as VueSimulatorRenderer;

    simulator.app = markRaw(createApp(SimulatorRendererView, { simulator }));

    simulator.router = markRaw(
        createRouter({
            history: createMemoryHistory('/'),
            routes: [],
        }),
    );

    simulator.getComponent = (componentName) => {
        const paths = componentName.split('.');
        const subs: string[] = [];
        while (paths.length > 0) {
            const component = components.value[componentName];
            if (component) {
                return getSubComponent(component, subs);
            }
            const sub = paths.pop();
            if (!sub) break;
            subs.unshift(sub);
            componentName = paths.join('.');
        }
        return null!;
    };

    simulator.getClosestNodeInstance = (ins, specId) => {
        if (isComponentRecord(ins)) {
            const { cid, did } = ins;
            const documentInstance = documentInstanceMap.get(did);
            const instance =
                documentInstance?.getComponentInstance(cid) ?? null;
            return (
                instance &&
                getClosestNodeInstanceByComponent(instance.$, specId)
            );
        }
        if (isElement(ins)) {
            return getClosestNodeInstance(ins, specId);
        }
    };

    simulator.findDOMNodes = (instance: ComponentRecord) => {
        if (instance) {
            const { did, cid } = instance;
            const documentInstance = documentInstanceMap.get(did);
            const compInst = documentInstance?.getComponentInstance(cid);
            return compInst ? findDOMNodes(compInst) : null;
        }
        return null;
    };

    simulator.getClientRects = (element) => getClientRects(element);

    simulator.setNativeSelection = (enable) => setNativeSelection(enable);

    simulator.setDraggingState = (state) => cursor.setDragging(state);

    simulator.setCopyState = (state) => cursor.setCopy(state);

    simulator.clearState = () => cursor.release();

    simulator.createComponent = () => null;

    simulator.rerender = () =>
        documentInstances.value.forEach((doc) => doc.rerender());

    simulator.dispose = () => {
        simulator.app.unmount();
        disposeFunctions.forEach((fn) => fn());
    };

    simulator.getCurrentDocument = () => {
        const crr = host.project.currentDocument.value;
        const docs = documentInstances.value;
        return docs.find((doc) => doc.id === crr.id);
    };

    let running = false;
    simulator.run = () => {
        if (running) return;
        running = true;
        const containerId = 'app';
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            document.body.appendChild(container);
            container.id = containerId;
        }
        document.documentElement.classList.add('engine-page');
        document.body.classList.add('engine-document');
        simulator.app.use(simulator.router).mount(container);
        host.designer.setRendererReady(simulator);
    };

    host.connect(simulator);

    const syncHostProps = () => {
        layout.value = host.project.get('config').layout;

        libraryMap.value = host.libraryMap || {};
        componentsMap.value = host.designer.componentsMap;

        components.value = {
            ...builtinComponents,
            ...buildComponents(
                libraryMap.value,
                componentsMap.value,
                simulator.createComponent,
            ),
        };

        // sync device
        device.value = host.device.value;

        // sync designMode
        designMode.value = host.designMode.value;
    };

    syncHostProps();

    const initDocument = () => {
        const { router } = simulator;
        documentInstances.value = host.project.documents.map((doc) => {
            let documentInstance = documentInstanceMap.get(doc.id);
            if (!documentInstance) {
                documentInstance = createDocumentInstance(doc);
                documentInstanceMap.set(doc.id, documentInstance);
                router.addRoute({
                    name: documentInstance.id,
                    path: documentInstance.path,
                    component: RendererView,
                    props: () => ({
                        key: documentInstance?.key,
                        documentInstance,
                        simulator,
                    }),
                });
            }
            return documentInstance;
        });
        router.getRoutes().forEach((route) => {
            const id = route.name as string;
            const hasDoc = documentInstances.value.some((doc) => doc.id === id);
            if (!hasDoc) {
                router.removeRoute(id);
                documentInstanceMap.delete(id);
            }
        });
        const inst = simulator.getCurrentDocument();
        if (inst && inst.id !== router.currentRoute.value.name) {
            router.replace({ name: inst.id });
        }
    };

    initDocument();

    return simulator;
}

export default createSimulatorRenderer();
