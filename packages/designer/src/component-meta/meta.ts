import { Copy, Delete, Lock, PreviewClose, PreviewOpen, Unlock } from '@icon-park/vue-next';
import type {
    IPublicModelComponentMeta,
    IPublicTypeComponentAction,
    IPublicTypeComponentMetadata,
    IPublicTypeNestingFilter,
    IPublicTypeNodeData,
    IPublicTypeNodeSchema,
    IPublicTypeNpmInfo,
    IPublicTypeTransformedComponentMetadata,
} from '@webank/letgo-types';
import { EventEmitter } from 'eventemitter3';
import { isRegExp } from 'lodash-es';
import { h } from 'vue';
import type { Designer } from '../designer';
import { Node, isNode } from '../node';
import addonCombine from '../transducers/addon-combine';
import parseDefault from '../transducers/parse-default';
import parseJSFunc from '../transducers/parse-func';
import { parseProps } from '../transducers/parse-props';
import type { INode } from '../types';
import Switch from './components/switch';

export function ensureAList(list?: string | string[]): string[] | null {
    if (!list)
        return null;

    if (!Array.isArray(list)) {
        if (typeof list !== 'string')
            return null;

        list = list.split(/ *[ ,|] */).filter(Boolean);
    }
    if (list.length < 1)
        return null;

    return list;
}

export function buildFilter(rule?: string | string[] | RegExp | IPublicTypeNestingFilter) {
    if (!rule)
        return null;

    if (typeof rule === 'function')
        return rule;

    if (isRegExp(rule)) {
        return (testNode: INode | IPublicTypeNodeSchema) =>
            rule.test(testNode.componentName);
    }
    const list = ensureAList(rule);
    if (!list)
        return null;

    return (testNode: INode | IPublicTypeNodeSchema) =>
        list.includes(testNode.componentName);
}

function preprocessMetadata(
    metadata: IPublicTypeComponentMetadata,
): IPublicTypeTransformedComponentMetadata {
    if (metadata.configure)
        return metadata as any;

    return {
        ...metadata,
        configure: {},
    };
}

interface IMetadataTransducer {
    (prev: IPublicTypeTransformedComponentMetadata): IPublicTypeTransformedComponentMetadata;
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

const metadataTransducers: IMetadataTransducer[] = [];

export function registerMetadataTransducer(
    transducer: IMetadataTransducer,
    level = 100,
    id?: string,
) {
    transducer.level = level;
    transducer.id = id;
    const i = metadataTransducers.findIndex(
        item => item.level != null && item.level > level,
    );
    if (i < 0)
        metadataTransducers.push(transducer);

    else
        metadataTransducers.splice(i, 0, transducer);
}

export function getRegisteredMetadataTransducers(): IMetadataTransducer[] {
    return metadataTransducers;
}

const builtinComponentActions: IPublicTypeComponentAction[] = [
    {
        name: 'copy',
        content: {
            icon: () => h(Copy, { size: 14 }),
            title: '复制',
            action(node: INode) {
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
        name: 'switch',
        content: ({ node }: { node: INode }) => {
            return [h(Switch, { node })];
        },
        important: true,
    },
    {
        name: 'remove',
        content: {
            icon: () => h(Delete, { size: 14 }),
            title: '删除',
            action(node: INode) {
                node.remove();
            },
        },
        important: true,
    },
    {
        name: 'lock',
        content: {
            icon: () => h(Lock, { size: 14 }),
            title: '锁定',
            action(node: INode) {
                node.setExtraPropValue('isLocked', true);
            },
        },
        condition: (node: INode) => {
            return node.isContainer() && !node.isLocked;
        },
        important: true,
    },
    {
        name: 'unlock',
        content: {
            icon: () => h(Unlock, { size: 14 }),
            title: '解锁',
            action(node: INode) {
                node.setExtraPropValue('isLocked', false);
            },
        },
        condition: (node: INode) => {
            return node.isContainer() && node.isLocked;
        },
        important: true,
    },
    {
        name: 'dialogOpen',
        content: {
            icon: () => h(PreviewOpen, { size: 14 }),
            title: '弹层显示',
            action(node: INode) {
                node.setExtraPropValue('isDialogOpen', true);
            },
        },
        condition: (node: INode) => {
            return !!node.componentMeta.dialogControlProp && !node.isDialogOpen;
        },
        important: true,
    },
    {
        name: 'dialogClose',
        content: {
            icon: () => h(PreviewClose, { size: 14 }),
            title: '弹层关闭',
            action(node: INode) {
                node.setExtraPropValue('isDialogOpen', false);
            },
        },
        condition: (node: INode) => {
            return !!node.componentMeta.dialogControlProp && node.isDialogOpen;
        },
        important: true,
    },
];

export class ComponentMeta implements IPublicModelComponentMeta<INode> {
    readonly isComponentMeta = true;

    private emitter = new EventEmitter();

    private _title: string;

    private _npm?: IPublicTypeNpmInfo;

    private _description?: string;

    private _componentName?: string;

    private _isContainer?: boolean;

    private _isModal?: boolean;

    private _dialogControlProp?: string;

    private _rootSelector?: string;

    private _acceptable?: boolean;

    private _isNullNode?: boolean;

    private _isMinimalRenderUnit?: boolean;

    private _transformedMetadata?: IPublicTypeTransformedComponentMetadata;

    private disableBehaviors?: string[];

    private _centerAction?: IPublicTypeComponentAction;
    private actions?: IPublicTypeComponentAction[];

    parentWhitelist?: IPublicTypeNestingFilter | null;

    childWhitelist?: IPublicTypeNestingFilter | null;

    get npm() {
        return this._npm;
    }

    set npm(_npm: IPublicTypeNpmInfo) {
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

    get dialogControlProp(): string | undefined {
        return this._dialogControlProp;
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

    constructor(readonly designer: Designer, metadata: IPublicTypeComponentMetadata) {
        this.setMetadata(metadata);
    }

    setNpm(info: IPublicTypeNpmInfo) {
        if (!this._npm)
            this._npm = info;
    }

    private transformMetadata(
        metadata: IPublicTypeComponentMetadata,
    ): IPublicTypeTransformedComponentMetadata {
        const result = getRegisteredMetadataTransducers().reduce(
            (prevMetadata, current) => {
                return current(prevMetadata);
            },
            preprocessMetadata(metadata),
        );

        if (!result.configure)
            result.configure = {};

        return result;
    }

    setMetadata(metadata: IPublicTypeComponentMetadata) {
        // 额外转换逻辑
        this._transformedMetadata = this.transformMetadata(metadata);

        const { componentName, npm, title, description, configure }
            = this._transformedMetadata;
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
            this._dialogControlProp = component.dialogControlProp;
            this._isMinimalRenderUnit = component.isMinimalRenderUnit;
            this.disableBehaviors
                = typeof component.disableBehaviors === 'string'
                    ? [component.disableBehaviors]
                    : component.disableBehaviors;
            this.actions = component.actions;
            this._centerAction = component.centerAction;
            if (component.nestingRule) {
                const { parentWhitelist, childWhitelist }
                    = component.nestingRule;
                this.parentWhitelist = buildFilter(parentWhitelist);
                this.childWhitelist = buildFilter(childWhitelist);
            }
        }
        else {
            this._isContainer = false;
            this._isModal = false;
        }
        this.emitter.emit('metadata_change');
    }

    getMetadata(): IPublicTypeTransformedComponentMetadata {
        return this._transformedMetadata;
    }

    isRootComponent(includeBlock = true) {
        return (
            this.componentName === 'Page'
            || this.componentName === 'Component'
            || (includeBlock && this.componentName === 'Block')
        );
    }

    get centerAction() {
        return this._centerAction;
    }

    get availableActions() {
        let { disableBehaviors, actions } = this;
        const disabled
            = ensureAList(disableBehaviors)
            || (this.isRootComponent(false)
                ? ['copy', 'remove', 'lock', 'unlock']
                : null);
        actions = builtinComponentActions.concat(
            this.designer.getGlobalComponentActions() || [],
            actions || [],
        );

        if (disabled) {
            if (disabled.includes('*')) {
                return actions.filter(
                    action => action.condition === 'always',
                );
            }
            return actions.filter(
                action => !disabled.includes(action.name),
            );
        }
        return actions;
    }

    checkNestingUp(my: INode | IPublicTypeNodeData, parent: INode) {
        // 检查父子关系，直接约束型，在画布中拖拽直接掠过目标容器
        if (this.parentWhitelist)
            return this.parentWhitelist(parent, isNode(my) ? my : my);

        return true;
    }

    checkNestingDown(my: INode, target: INode | IPublicTypeNodeSchema | IPublicTypeNodeSchema[]) {
        // 检查父子关系，直接约束型，在画布中拖拽直接掠过目标容器
        if (this.childWhitelist) {
            const _target: any = !Array.isArray(target) ? [target] : target;
            return _target.every((item: INode | IPublicTypeNodeSchema) => {
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

export function removeBuiltinComponentAction(name: string) {
    const i = builtinComponentActions.findIndex(
        action => action.name === name,
    );
    if (i > -1)
        builtinComponentActions.splice(i, 1);
}
export function addBuiltinComponentAction(action: IPublicTypeComponentAction) {
    builtinComponentActions.push(action);
}

export function modifyBuiltinComponentAction(
    actionName: string,
    handle: (action: IPublicTypeComponentAction) => void,
) {
    const builtinAction = builtinComponentActions.find(
        action => action.name === actionName,
    );
    if (builtinAction)
        handle(builtinAction);
}

registerMetadataTransducer(parseJSFunc, 1, 'parse-func');

registerMetadataTransducer(parseProps, 5, 'parse-props');

registerMetadataTransducer(addonCombine, 10, 'combine-props');

registerMetadataTransducer(parseDefault, 100, 'parse-nesting-rule');
