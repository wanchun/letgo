import { IPublicEnumPageLifecycle } from '@webank/letgo-types';

export const PageLifecycleList = [
    {
        value: IPublicEnumPageLifecycle.BeforeMount,
        label: '挂载前',
    },
    {
        value: IPublicEnumPageLifecycle.Mounted,
        label: '挂载后',
    },
    {
        value: IPublicEnumPageLifecycle.BeforeUnMount,
        label: '卸载前',
    },
    {
        value: IPublicEnumPageLifecycle.UnMounted,
        label: '卸载后',
    },
];
