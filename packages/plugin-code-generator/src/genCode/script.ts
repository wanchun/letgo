import { RootSchema } from '@webank/letgo-types';

export function genScript(rootSchema: RootSchema) {
    if (rootSchema.code) {
        return `<script setup>
            ${rootSchema.code || ''}
        </script>`;
    }
    return '';
}
