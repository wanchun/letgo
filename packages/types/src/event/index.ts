import type * as Node from './node';

export interface IPublicTypeEventConfig {
    [Node.Prop.Change]: (options: Node.Prop.IPublicTypeChangeOptions) => any
    [Node.Prop.InnerChange]: (options: Node.Prop.IPublicTypeChangeOptions) => any
    [Node.Rerender]: (options: Node.IPublicTypeRerenderOptions) => void
    [eventName: string]: any
}

export * as Node from './node';
