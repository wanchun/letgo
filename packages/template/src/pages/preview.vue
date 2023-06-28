<script lang="ts">
import { defineComponent, onMounted, ref, shallowRef } from 'vue';
import VueRenderer, { RendererApp } from '@webank/letgo-renderer';
import { AssetLoader, buildComponents } from '@webank/letgo-common';
import type { IPublicTypeAsset, IPublicTypePackage } from '@webank/letgo-types';

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
        VueRenderer,
        RendererApp,
    },
    setup() {
        const scenarioName = getScenarioName();

        const packages: IPublicTypePackage[] = getPackagesFromLocalStorage(scenarioName);

        const projectSchema = getProjectSchemaFromLocalStorage(scenarioName);

        const {
            componentsMap: componentsMapArray,
            componentsTree,
        } = projectSchema;

        const componentsMap: any = {};
        componentsMapArray.forEach((component: any) => {
            componentsMap[component.componentName] = component;
        });

        const libraryMap: Record<string, string> = {};
        const libraryAsset: IPublicTypeAsset = [];
        packages.forEach(({ package: _package, library, urls }) => {
            libraryMap[_package] = library;
            if (urls)
                libraryAsset.push(urls);
        });

        const pageSchema = componentsTree[0];

        const components = shallowRef([]);

        const isReady = ref(false);

        onMounted(async () => {
            libraryAsset.push('https://lf1-cdn-tos.bytegoofy.com/obj/iconpark/svg_25753_22.ce2d9ec2f0a0485d535c374cb4d448a5.js');
            const assetLoader = new AssetLoader();
            await assetLoader.load(libraryAsset);

            components.value = buildComponents(
                libraryMap,
                componentsMap,
            );

            isReady.value = true;
        });

        return {
            projectSchema,
            pageSchema,
            components,
            isReady,
        };
    },
});
</script>

<template>
  <RendererApp v-if="isReady" :project-schema="projectSchema">
    <VueRenderer class="engine" :schema="pageSchema" :components="components" />
  </RendererApp>
  <div v-else>
    正在加载中....
  </div>
</template>

<style>
.engine {
    width: 100%;
    height: 100%;
}
</style>
