import type { DocumentModel } from '@webank/letgo-designer';
import { IPublicEnumTransformStage } from '@webank/letgo-types';
import type { IPublicTypeAssetList, IPublicTypeComponentInstance } from '@webank/letgo-types';
import { AssetLoader, buildComponents, cursor, getConvertedExtraKey, getSubComponent, isElement, setNativeSelection } from '@webank/letgo-common';
import type {
    Component,
    Ref,
} from 'vue';
import {
    computed,
    createApp,
    markRaw,
    onUnmounted,
    reactive,
    ref,
    shallowRef,
    toRaw,
} from 'vue';
import { config, createComponent, isVNodeHTMLElement } from '@webank/letgo-renderer';
import { builtinComponents } from '@webank/letgo-components';
import { createMemoryHistory, createRouter } from 'vue-router';
import { debounce, isPlainObject, omit } from 'lodash-es';
import type {
    DocumentInstance,
    MixedComponent,
    SimulatorViewLayout,
    VueSimulatorRenderer,
} from './interface';
import { SimulatorApp, SimulatorPage } from './view';
import { host } from './host';
import type {
    CompRootHTMLElement,
} from './utils';
import {
    ComponentRecord,
    findDOMNodes,
    getClientRects,
    getClosestNodeInstance,
    getClosestNodeInstanceByComponent,
    getCompRootData,
    isComponentRecord,
    setCompRootData,
} from './utils';
import './simulator.less';

function createDocumentInstance(document: DocumentModel): DocumentInstance {
    /** 记录单个节点的组件实例列表 */
    const instancesMap = new Map<string, IPublicTypeComponentInstance[]>();
    /** 记录 vue 组件实例和组件 uid 的映射关系 */
    const vueInstanceMap = reactive(new Map<number, IPublicTypeComponentInstance>());

    const timestamp = ref(Date.now());

    const checkInstanceMounted = (instance: IPublicTypeComponentInstance): boolean => {
        return '$' in instance ? instance.$.isMounted : !!instance;
    };

    const setHostInstance = (
        docId: string,
        nodeId: string,
        instances: IPublicTypeComponentInstance[] | null,
    ) => {
        const instanceRecords = !instances
            ? null
            : instances.map(
                inst => new ComponentRecord(docId, nodeId, inst.$.uid),
            );
        host.setInstance(docId, nodeId, instanceRecords);
    };

    const getComponentInstance = (id: number) => {
        return vueInstanceMap.get(id);
    };

    const unmountInstance = (id: string, instance: IPublicTypeComponentInstance) => {
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

    const mountInstance = (id: string, instanceOrEl: IPublicTypeComponentInstance | HTMLElement) => {
        const docId = document.id;
        if (instanceOrEl == null) {
            let instances = instancesMap.get(id);
            if (instances) {
                instances = instances.filter(checkInstanceMounted);
                if (instances.length > 0) {
                    instancesMap.set(id, instances);
                    setHostInstance(docId, id, instances);
                }
                else {
                    instancesMap.delete(id);
                    setHostInstance(docId, id, null);
                }
            }
            return;
        }

        let el: CompRootHTMLElement;
        let instance: IPublicTypeComponentInstance;

        if ('$' in instanceOrEl) {
            instance = instanceOrEl;
            el = instance.$el;
        }
        else if (isVNodeHTMLElement(instanceOrEl)) {
            instance = instanceOrEl.__vueParentComponent.proxy!;
            el = (instanceOrEl as unknown) as CompRootHTMLElement;
        }
        else {
            return;
        }

        const origId = getCompRootData(el).nodeId;

        if (origId && origId !== id) {
            // 另外一个节点的 instance 在此被复用了，需要从原来地方卸载
            unmountInstance(origId, instance);
        }

        onUnmounted(() => unmountInstance(id, instance), instance.$);

        setCompRootData(el, {
            nodeId: id,
            docId,
            instance,
        });

        const instances = instancesMap.get(id) || [];

        if (instances.includes(instance))
            return;
        else
            instances.push(instance);

        vueInstanceMap.set(instance.$.uid, instance);
        instancesMap.set(id, instances);
        setHostInstance(docId, id, instances);
    };

    const getNode: DocumentInstance['getNode'] = (id) => {
        return id ? document.getNode(id) : null;
    };

    const defaultProps = shallowRef(document.root.getExtraProp('defaultProps')?.getValue());
    document.root.onPropChange(debounce((info) => {
        const { prop } = info;
        const rootPropKey: string = prop.path[0];
        if (rootPropKey === getConvertedExtraKey('defaultProps'))
            defaultProps.value = document.root.getExtraProp('defaultProps').getValue();
    }, 300));

    return reactive({
        defaultProps,
        id: computed(() => document.id),
        path: computed(() => {
            const { fileName } = document;
            return fileName.startsWith('/') ? fileName : `/${fileName}`;
        }),
        key: computed(() => `${document.id}:${timestamp.value}`),
        schema: computed(() => document.exportSchema(IPublicEnumTransformStage.Render)),
        document: computed(() => document),
        instancesMap: computed(() => instancesMap),
        vueInstanceMap,
        getNode,
        mountInstance,
        unmountInstance,
        getComponentInstance,
        rerender: () => (timestamp.value = Date.now()),
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

    const assetLoader = new AssetLoader();

    const syncHostProps = () => {
        layout.value = host.project.get('config').layout;

        // sync device
        device.value = host.device;

        // sync designMode
        designMode.value = host.designMode;
    };

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
        libraryUpdate: 0,
    }) as VueSimulatorRenderer;

    simulator.app = markRaw(createApp(SimulatorApp, { simulator }));

    simulator.router = markRaw(
        createRouter({
            history: createMemoryHistory('/'),
            routes: [],
        }),
    );

    simulator.builtinComponents = () => {
        libraryMap.value = host.libraryMap || {};
        componentsMap.value = host.designer.componentsMap;
        components.value = {
            ...builtinComponents,
            ...buildComponents(
                libraryMap.value,
                componentsMap.value,
                createComponent,
            ),
        };
    };

    simulator.getComponent = (componentName) => {
        const paths = componentName.split('.');
        const subs: string[] = [];
        while (paths.length > 0) {
            const component = components.value[componentName];
            if (component)
                return getSubComponent(component, subs);

            const sub = paths.pop();
            if (!sub)
                break;
            subs.unshift(sub);
            componentName = paths.join('.');
        }
        return null!;
    };

    simulator.getClosestNodeInstance = (ins, specId) => {
        if (isComponentRecord(ins)) {
            const { cid, did } = ins;
            const documentInstance = documentInstanceMap.get(did);
            const instance
                = documentInstance?.getComponentInstance(cid) ?? null;
            return (
                instance
                && getClosestNodeInstanceByComponent(instance.$, specId)
            );
        }
        if (isElement(ins))
            return getClosestNodeInstance(ins, specId);
    };

    function removeVueInstance(data: Record<string, any>) {
        const omitKeys: string[] = [];
        for (const key in data) {
            if (isPlainObject(data[key])) {
                if (data[key].__v_skip != null)
                    omitKeys.push(key);
                else
                    data[key] = removeVueInstance({ ...data[key] });
            }
        }
        if (omitKeys.length)
            return omit({ ...data }, omitKeys);

        return data;
    }

    simulator.getNodeInstanceExpose = (ins) => {
        if (isComponentRecord(ins)) {
            const { cid, did } = ins;
            const documentInstance = documentInstanceMap.get(did);
            const instance
                = documentInstance?.getComponentInstance(cid) ?? null;

            if (!instance)
                return {};

            // @ts-expect-error __scope letgo 属性
            return removeVueInstance({ __scope: instance.__scope, ...toRaw(instance.$props), ...toRaw(instance.$.setupState), ...toRaw(instance.$.exposed) });
        }
        return {};
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

    simulator.getClientRects = element => getClientRects(element);

    simulator.setNativeSelection = enable => setNativeSelection(enable);

    simulator.setDraggingState = state => cursor.setDragging(state);

    simulator.setCopyState = state => cursor.setCopy(state);

    simulator.clearState = () => cursor.release();

    simulator.createComponent = () => null;

    simulator.rerender = () => {
        documentInstances.value.forEach(doc => doc.rerender());
    };

    // REFACTOR
    simulator.buildGlobalUtils = () => {
        simulator.libraryUpdate += 1;
    };

    simulator.load = async (asset: IPublicTypeAssetList) => {
        await assetLoader.load(asset);
    };

    simulator.loadAsyncLibrary = async (asyncLibraryMap: Record<string, any>) => {
        await assetLoader.loadAsyncLibrary(asyncLibraryMap);
    };

    simulator.dispose = () => {
        simulator.app.unmount();
        disposeFunctions.forEach(fn => fn());
    };

    simulator.getCurrentDocument = () => {
        const crr = host.project.currentDocument;
        const docs = documentInstances.value;
        return docs.find(doc => doc.id === crr.id);
    };

    let running = false;
    simulator.run = () => {
        if (running)
            return;
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

    syncHostProps();
    simulator.builtinComponents();

    simulator.initDocument = () => {
        const router = simulator.router;
        documentInstances.value = host.project.documents.map((doc) => {
            let documentInstance = documentInstanceMap.get(doc.id);
            if (!documentInstance) {
                documentInstance = createDocumentInstance(doc);
                documentInstanceMap.set(doc.id, documentInstance);
                router.addRoute({
                    name: documentInstance.id,
                    path: documentInstance.path,
                    component: SimulatorPage,
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
            const hasDoc = documentInstances.value.some(doc => doc.id === id);
            if (!hasDoc) {
                router.removeRoute(id);
                documentInstanceMap.delete(id);
            }
        });
        const inst = simulator.getCurrentDocument();
        if (inst && inst.id !== router.currentRoute.value.name)
            router.replace({ name: inst.id });
    };

    simulator.initDocument();

    return simulator;
}

export default createSimulatorRenderer();
