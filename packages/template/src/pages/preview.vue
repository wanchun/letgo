<script lang="ts">
import { defineComponent } from 'vue';
import RendererApp from '@harrywan/letgo-renderer';
import type { IPublicTypeAsset } from '@harrywan/letgo-types';

const getScenarioName = function () {
    if (location.search)
        return new URLSearchParams(location.search.slice(1)).get('scenarioName') || 'general';

    return 'general';
};

export function getPackagesFromLocalStorage(scenarioName: string) {
    if (!scenarioName) {
        console.error('scenarioName is required!');
        return;
    }
    return JSON.parse(window.localStorage.getItem(`${scenarioName}_packages`) || '{}');
}

export function getProjectSchemaFromLocalStorage(scenarioName: string) {
    if (!scenarioName) {
        console.error('scenarioName is required!');
        return;
    }
    const localValue = window.localStorage.getItem(scenarioName);
    if (localValue)
        return JSON.parse(localValue);

    return undefined;
}

export default defineComponent({
    components: {
        RendererApp,
    },
    setup() {
        const scenarioName = getScenarioName();

        const projectSchema = getProjectSchemaFromLocalStorage(scenarioName);

        const { componentsTree } = projectSchema;

        const libraryAsset: IPublicTypeAsset = ['https://lf1-cdn-tos.bytegoofy.com/obj/iconpark/svg_25753_22.ce2d9ec2f0a0485d535c374cb4d448a5.js'];

        const pageSchema = componentsTree[0];

        return {
            libraryAsset,
            projectSchema,
            pageSchema,
        };
    },
});
</script>

<template>
  <RendererApp class="engine" :assets="libraryAsset" :page-schema="pageSchema" :project-schema="projectSchema">
    <template #loading>
      正在加载中...
    </template>
  </RendererApp>
</template>

<style>
.engine {
    width: 100%;
    height: 100%;
}
</style>
