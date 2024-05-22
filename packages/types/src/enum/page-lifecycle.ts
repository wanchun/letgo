export enum IPublicEnumPageLifecycle {
    BeforeMount = 'onBeforeMount',
    Mounted = 'onMounted',
    BeforeUnMount = 'onBeforeUnmount',
    UnMounted = 'onUnmounted',
}

export const IPublicPageLifecycleList = [
    {
        value: IPublicEnumPageLifecycle.BeforeMount,
        label: '挂载前',
    },
    {
        value: IPublicEnumPageLifecycle.Mounted,
        label: '挂载后',
    },
    {
        value: IPublicEnumPageLifecycle.Mounted,
        label: '卸载前',
    },
    {
        value: IPublicEnumPageLifecycle.UnMounted,
        label: '卸载后',
    },
];
