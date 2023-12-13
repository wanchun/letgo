import type { IPublicTypeIcon } from '@webank/letgo-types';

const URL_RE = /^(https?:)\/\//i;

export function createIcon(
    icon?: IPublicTypeIcon | null,
    props?: Record<string, unknown>,
) {
    if (!icon)
        return null;

    if (typeof icon === 'string') {
        if (URL_RE.test(icon))
            return <img src={icon} {...props} />;
    }

    if (typeof icon === 'function')
        return icon(props);

    return null;
}
