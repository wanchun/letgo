export type IPublicTypeDOMText = string;

export function isDOMText(data: any): data is IPublicTypeDOMText {
    return typeof data === 'string';
}
