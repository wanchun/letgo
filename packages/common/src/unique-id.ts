let guid = Date.now();
export function uniqueId(prefix = '') {
    return `${prefix}${(guid++).toString(36).toLowerCase()}${(Math.random() * 10000).toString(36).split('.')[0]}`;
}
