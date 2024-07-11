import { isGetterProp } from '@webank/letgo-common';

export * from './page-base';
export * from './global-base';
export * from './component-base';

export function executeClassPropReactive(instance: object, member: string) {
    if (member.startsWith('$') || isGetterProp(instance, member) || typeof instance[member as keyof typeof instance] === 'function')
        return false;

    return true;
}
