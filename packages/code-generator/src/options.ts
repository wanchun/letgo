import type { GenOptions } from './common/types';

let options: GenOptions;

const defaultOptions: Partial<GenOptions> = {
    outDir: 'src/letgo',
    pageDir: 'src/pages',
};

export function setOptions(_options: GenOptions) {
    options = { ...defaultOptions, ..._options };
    return options;
}

export function getOptions(): GenOptions | undefined {
    return options;
}

export function relative(from: string, to: string) {
    return `${Array(from.split('/').length).join('../')}${to}`;
}
