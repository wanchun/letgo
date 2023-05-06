export * as Prop from './prop';

export interface IPublicTypeRerenderOptions {
    time: number
    componentName?: string
    type?: string
    nodeCount?: number
}

export const Rerender = 'node.rerender';
