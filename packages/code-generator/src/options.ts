import type { GenOptions } from './common/types';

let options: GenOptions;

const defaultOptions: Partial<GenOptions> = {
    letgoDir: 'src/letgo',
    outDir: 'src/pages',
    globalCssFileName: 'global.css',
};

export function setOptions(_options: GenOptions) {
    options = { ...defaultOptions, ..._options };
    return options;
}

export function getOptions(): GenOptions | undefined {
    return options;
}

export function relative(from: string, to: string) {
    let fromArr = from.split('/');
    let toArr = to.split('/');
    let commonLen = 0;
    for (let i = 0; i < Math.min(fromArr.length, toArr.length); i++) {
        if (fromArr[i] === toArr[i])
            commonLen += 1;

        else
            break;
    }
    fromArr = fromArr.slice(commonLen);
    toArr = toArr.slice(commonLen);
    return `${Array(fromArr.length).join('../') || './'}${toArr.join('/')}`;
}
