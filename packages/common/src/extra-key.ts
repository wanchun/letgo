export const EXTRA_KEY_PREFIX = '___';

export function getConvertedExtraKey(key: string): string {
    if (!key)
        return '';

    let _key = key;
    if (key.indexOf('.') > 0)
        _key = key.split('.')[0];

    return EXTRA_KEY_PREFIX + _key + EXTRA_KEY_PREFIX + key.slice(_key.length);
}

export function getOriginalExtraKey(key: string): string {
    return key.replace(new RegExp(`${EXTRA_KEY_PREFIX}`, 'g'), '');
}
