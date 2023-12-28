export type IPublicTypeRects = DOMRect[] & {
    elements: Array<Element | Text>
};

export type IPublicTypeRect = DOMRect & {
    elements?: Array<Element | Text>
    computed?: boolean
};
