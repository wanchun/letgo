<script lang="ts">
import { defineComponent } from 'vue';
import RendererApp from '@webank/letgo-renderer';

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

        const pageSchema = componentsTree[0];

        return {
            projectSchema,
            pageSchema,
        };
    },
});
</script>

<template>
  <RendererApp class="engine" :page-schema="pageSchema" :project-schema="projectSchema">
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
