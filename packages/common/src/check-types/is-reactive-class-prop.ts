import { isGetterProp } from '../utils';

export function isReactiveClassProp(instance: object, member: string) {
    if (member.startsWith('_') || member.startsWith('$') || isGetterProp(instance, member) || typeof instance[member as keyof typeof instance] === 'function')
        return false;

    return true;
}
