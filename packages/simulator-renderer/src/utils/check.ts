export type ESModule = {
    __esModule: true;
    default: any;
};

export function isESModule(obj: any) {
    return obj && !!obj.__esModule;
}
