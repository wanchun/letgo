export function isGetterProp(instance: object, key: string) {
    if (key in instance) {
        let p = instance;
        let propDesc;
        while (p && !propDesc) {
            propDesc = Object.getOwnPropertyDescriptor(p, key);
            p = Object.getPrototypeOf(p);
        }
        // only getter
        return !!propDesc && (propDesc.get && !propDesc.set);
    }
    return false;
}
