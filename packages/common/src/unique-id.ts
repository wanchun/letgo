let guid = Date.now();
export function uniqueId(prefix = '') {
    return `${prefix ? `${prefix}_` : ''}${(guid++).toString(36).toLowerCase()}_${(Math.random() * 10000).toString(36).split('.')[0]}`;
}
