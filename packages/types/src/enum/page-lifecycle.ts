export enum IPublicEnumPageLifecycle {
    BeforeMount = 'beforeMount',
    Mounted = 'mounted',
    BeforeUnMount = 'beforeUnMount',
    UnMount = 'unMount',
}

export const IPublicPageLifecycleList = [
    {
        value: 'beforeMount',
        label: '挂载前',
    },
    {
        value: 'mounted',
        label: '挂载后',
    },
    {
        value: 'beforeUnMount',
        label: '卸载前',
    },
    {
        value: 'unMount',
        label: '卸载后',
    },
];
