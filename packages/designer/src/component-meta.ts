import { EventEmitter } from 'eventemitter3';
import {
    NpmInfo,
    NestingFilter,
    NodeSchema,
    ComponentAction,
    ComponentMetadata,
    NodeData,
    TransformedComponentMetadata,
} from '@webank/letgo-types';
import { h } from 'vue';
import { isRegExp } from 'lodash-es';
import { Lock, Unlock, Copy, Delete, FileHidingOne } from '@icon-park/vue-next';
import { Designer } from './designer';
import { isNode, Node } from './node';
import parseNestingRule from './transducers/nesting-rule';
import addonCombine from './transducers/addon-combine';
import parseJSFunc from './transducers/parse-func';
import parseProps from './transducers/parse-props';
import { ParentalNode } from './types';

export function ensureAList(list?: string | string[]): string[] | null {
    if (!list) {
        return null;
    }
    if (!Array.isArray(list)) {
        if (typeof list !== 'string') {
            return null;
        }
        list = list.split(/ *[ ,|] */).filter(Boolean);
    }
    if (list.length < 1) {
        return null;
    }
    return list;
}

export function buildFilter(rule?: string | string[] | RegExp | NestingFilter) {
    if (!rule) {
        return null;
    }
    if (typeof rule === 'function') {
        return rule;
    }
    if (isRegExp(rule)) {
        return (testNode: Node | NodeSchema) =>
            rule.test(testNode.componentName);
    }
    const list = ensureAList(rule);
    if (!list) {
        return null;
    }
    return (testNode: Node | NodeSchema) =>
        list.includes(testNode.componentName);
}

function preprocessMetadata(
    metadata: ComponentMetadata,
): TransformedComponentMetadata {
    if (metadata.configure) {
        return metadata as any;
    }

    return {
        ...metadata,
        configure: {},
    };
}

export interface MetadataTransducer {
    (prev: TransformedComponentMetadata): TransformedComponentMetadata;
    /**
     * 0 - 9   system
     * 10 - 99 builtin-plugin
     * 100 -   app & plugin
     */
    level?: number;
    /**
     * use to replace TODO
     */
    id?: string;
}

const metadataTransducers: MetadataTransducer[] = [];

export function registerMetadataTransducer(
    transducer: MetadataTransducer,
    level = 100,
    id?: string,
) {
    transducer.level = level;
    transducer.id = id;
    const i = metadataTransducers.findIndex(
        (item) => item.level != null && item.level > level,
    );
    if (i < 0) {
        metadataTransducers.push(transducer);
    } else {
        metadataTransducers.splice(i, 0, transducer);
    }
}

export function getRegisteredMetadataTransducers(): MetadataTransducer[] {
    return metadataTransducers;
}

export class ComponentMeta {
    readonly isComponentMeta = true;

    private emitter = new EventEmitter();

    private _title: string;

    private _npm?: NpmInfo;

    private _description?: string;

    private _componentName?: string;

    private _isContainer?: boolean;

    private _isModal?: boolean;

    private _rootSelector?: string;

    private _acceptable?: boolean;

    private _isNullNode?: boolean;

    private _isMinimalRenderUnit?: boolean;

    private _transformedMetadata?: TransformedComponentMetadata;

    private disableBehaviors?: string[];

    private actions?: ComponentAction[];

    parentWhitelist?: NestingFilter | null;

    childWhitelist?: NestingFilter | null;

    get npm() {
        return this._npm;
    }

    set npm(_npm: NpmInfo) {
        this.setNpm(_npm);
    }

    get componentName(): string {
        return this._componentName;
    }

    get isContainer(): boolean {
        return this._isContainer || this.isRootComponent();
    }

    get isModal(): boolean {
        return this._isModal;
    }

    get title(): string {
        return this._title;
    }

    get description(): string | undefined {
        return this._description;
    }

    get rootSelector(): string | undefined {
        return this._rootSelector;
    }

    get acceptable(): boolean {
        return this._acceptable;
    }

    get isMinimalRenderUnit(): boolean {
        return this._isMinimalRenderUnit || false;
    }

    get isNullNode(): boolean {
        return this._isNullNode || false;
    }

    get propsConfigure() {
        const config = this._transformedMetadata?.configure;
        return config?.combined || config?.props || [];
    }

    constructor(readonly designer: Designer, metadata: ComponentMetadata) {
        this.setMetadata(metadata);
    }

    setNpm(info: NpmInfo) {
        if (!this._npm) {
            this._npm = info;
        }
    }

    private transformMetadata(
        metadata: ComponentMetadata,
    ): TransformedComponentMetadata {
        const result = getRegisteredMetadataTransducers().reduce(
            (prevMetadata, current) => {
                return current(prevMetadata);
            },
            preprocessMetadata(metadata),
        );

        if (!result.configure) {
            result.configure = {};
        }

        return result;
    }

    setMetadata(metadata: ComponentMetadata) {
        // ??????????????????
        this._transformedMetadata = this.transformMetadata(metadata);
        const { componentName, npm, title, description, configure } =
            this._transformedMetadata;
        this._npm = npm || this._npm;
        this._componentName = componentName;
        this._title = title;
        this._description = description;
        this._acceptable = false;

        const { component } = configure;
        if (component) {
            this._isContainer = !!component.isContainer;
            this._isModal = !!component.isModal;
            this._rootSelector = component.rootSelector;
            this._isNullNode = component.isNullNode;
            this._isMinimalRenderUnit = component.isMinimalRenderUnit;
            this.disableBehaviors =
                typeof component.disableBehaviors === 'string'
                    ? [component.disableBehaviors]
                    : component.disableBehaviors;
            this.actions = component.actions;
            if (component.nestingRule) {
                const { parentWhitelist, childWhitelist } =
                    component.nestingRule;
                this.parentWhitelist = buildFilter(parentWhitelist);
                this.childWhitelist = buildFilter(childWhitelist);
            }
        } else {
            this._isContainer = false;
            this._isModal = false;
        }
        this.emitter.emit('metadata_change');
    }

    getMetadata(): TransformedComponentMetadata {
        return this._transformedMetadata;
    }

    isRootComponent(includeBlock = true) {
        return (
            this.componentName === 'Page' ||
            this.componentName === 'Component' ||
            (includeBlock && this.componentName === 'Block')
        );
    }

    get availableActions() {
        // eslint-disable-next-line prefer-const
        let { disableBehaviors, actions } = this;
        const disabled =
            ensureAList(disableBehaviors) ||
            (this.isRootComponent(false)
                ? ['copy', 'remove', 'lock', 'unlock']
                : null);
        actions = builtinComponentActions.concat(
            this.designer.getGlobalComponentActions() || [],
            actions || [],
        );

        if (disabled) {
            if (disabled.includes('*')) {
                return actions.filter(
                    (action) => action.condition === 'always',
                );
            }
            return actions.filter(
                (action) => disabled.indexOf(action.name) < 0,
            );
        }
        return actions;
    }

    checkNestingUp(my: Node | NodeData, parent: ParentalNode) {
        // ?????????????????????????????????????????????????????????????????????????????????
        if (this.parentWhitelist) {
            return this.parentWhitelist(parent, isNode(my) ? my : my);
        }
        return true;
    }

    checkNestingDown(my: Node, target: Node | NodeSchema | NodeSchema[]) {
        // ?????????????????????????????????????????????????????????????????????????????????
        if (this.childWhitelist) {
            const _target: any = !Array.isArray(target) ? [target] : target;
            return _target.every((item: Node | NodeSchema) => {
                const _item = !isNode(item)
                    ? new Node(my.document, item)
                    : item;
                return this.childWhitelist && this.childWhitelist(_item, my);
            });
        }
        return true;
    }

    onMetadataChange(fn: (args: any) => void): () => void {
        this.emitter.on('metadata_change', fn);
        return () => {
            this.emitter.off('metadata_change', fn);
        };
    }
}

export function isComponentMeta(obj: any): obj is ComponentMeta {
    return obj && obj.isComponentMeta;
}

const builtinComponentActions: ComponentAction[] = [
    {
        name: 'remove',
        content: {
            icon: () => [h(Delete, { size: 14 })],
            title: '??????',
            action(node: Node) {
                node.remove();
            },
        },
        important: true,
    },
    {
        name: 'hide',
        content: {
            icon: () => [h(FileHidingOne, { size: 14 })],
            title: '??????',
            action(node: Node) {
                node.setVisible(false);
            },
        },
        condition: (node: Node) => {
            return node.componentMeta.isModal;
        },
        important: true,
    },
    {
        name: 'copy',
        content: {
            icon: () => [h(Copy, { size: 14 })],
            title: '??????',
            action(node: Node) {
                const { document: doc, parent, index } = node;
                if (parent) {
                    const newNode = doc.insertNode(
                        parent,
                        node,
                        index + 1,
                        true,
                    );
                    doc.selection.select(newNode.id);
                }
                // TODO
            },
        },
        important: true,
    },
    {
        name: 'lock',
        content: {
            icon: () => [h(Lock, { size: 14 })],
            title: '??????',
            action(node: Node) {
                node.props.getExtraProp('isLock').setValue(true);
            },
        },
        condition: (node: Node) => {
            return node.isContainer() && !node.isLocked;
        },
        important: true,
    },
    {
        name: 'unlock',
        content: {
            icon: () => [h(Unlock, { size: 14 })],
            title: '??????',
            action(node: Node) {
                node.props.getExtraProp('isLock').setValue(false);
            },
        },
        condition: (node: Node) => {
            return node.isContainer() && node.isLocked;
        },
        important: true,
    },
];

export function removeBuiltinComponentAction(name: string) {
    const i = builtinComponentActions.findIndex(
        (action) => action.name === name,
    );
    if (i > -1) {
        builtinComponentActions.splice(i, 1);
    }
}
export function addBuiltinComponentAction(action: ComponentAction) {
    builtinComponentActions.push(action);
}

export function modifyBuiltinComponentAction(
    actionName: string,
    handle: (action: ComponentAction) => void,
) {
    const builtinAction = builtinComponentActions.find(
        (action) => action.name === actionName,
    );
    if (builtinAction) {
        handle(builtinAction);
    }
}

registerMetadataTransducer(parseJSFunc, 1, 'parse-func');

registerMetadataTransducer(parseProps, 5, 'parse-props');

registerMetadataTransducer(addonCombine, 10, 'combine-props');

registerMetadataTransducer(parseNestingRule, 100, 'component-defaults');
