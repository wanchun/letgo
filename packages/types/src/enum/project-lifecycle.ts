export enum IPublicEnumProjectLifecycle {
    BeforeRender = 'beforeRender',
}

export const IPublicProjectLifecycleList = [
    {
        value: IPublicEnumProjectLifecycle.BeforeRender,
        label: '应用渲染前',
    },
];
