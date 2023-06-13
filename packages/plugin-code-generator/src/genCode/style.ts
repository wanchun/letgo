import type { IPublicTypeRootSchema } from '@webank/letgo-types';

export function genStyle(rootSchema: IPublicTypeRootSchema) {
    if (rootSchema.css) {
        return `<style lang="less" scoped>
            ${rootSchema.css}
        </style>`;
    }
    return '';
}
