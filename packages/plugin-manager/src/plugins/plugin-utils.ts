import { isPlainObject } from 'lodash';
import type { IPluginPreferenceDeclaration } from './plugin-types';

export function isValidPreferenceKey(
    key: string,
    preferenceDeclaration: IPluginPreferenceDeclaration,
): boolean {
    if (
        !preferenceDeclaration ||
        !Array.isArray(preferenceDeclaration.properties)
    ) {
        return false;
    }
    return preferenceDeclaration.properties.some((prop) => {
        return prop.key === key;
    });
}

export function filterValidOptions(
    opts: any,
    preferenceDeclaration: IPluginPreferenceDeclaration,
) {
    if (!opts || !isPlainObject(opts)) return opts;
    const filteredOpts = {} as any;
    Object.keys(opts).forEach((key) => {
        if (isValidPreferenceKey(key, preferenceDeclaration)) {
            const v = opts[key];
            if (v !== undefined && v !== null) {
                filteredOpts[key] = v;
            }
        }
    });
    return filteredOpts;
}
