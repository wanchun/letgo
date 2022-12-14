import { RootSchema } from '@webank/letgo-types';

export function genStyle(rootSchema: RootSchema) {
    if (rootSchema.css) {
        return `<style lang="less" scoped>
            ${rootSchema.css}
        </style>`;
    }
    return '';
}
