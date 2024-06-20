import { version } from './engine-core';

export * from './engine-core';
export { StyleSetter, IconSetter } from '@webank/letgo-engine-ext';
export { definePlugin } from '@webank/letgo-engine-plugin';
export * from '@webank/letgo-engine-plugin/es/types';
export * from '@webank/letgo-editor-skeleton/es/types';
export * from '@webank/letgo-types';

// eslint-disable-next-line no-console
console.log(
    `%c LetgoLowCodeEngine %c v${version} `,
    'padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: #606060; font-weight: bold;',
    'padding: 2px 1px; border-radius: 0 3px 3px 0; color: #fff; background: #42c02e; font-weight: bold;',
);
