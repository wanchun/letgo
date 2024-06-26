import type { Options } from 'acorn';

export const ASTParseOptions: Options = {
    allowReturnOutsideFunction: true,
    allowImportExportEverywhere: true,
    allowHashBang: true,
    allowAwaitOutsideFunction: true,
    ecmaVersion: 'latest',
};
