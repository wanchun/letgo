<script lang="ts">
import { defineComponent } from 'vue';
import { LetgoEngine, project } from '@harrywan/letgo-engine';
import { createRequest } from '@qlin/request';

export default defineComponent({
    components: { LetgoEngine },
    setup() {
        const onReady = () => {
            project.openDocument(
                {
                    componentName: 'Page',
                    id: 'root',
                    ref: 'root',
                    props: {},
                    fileName: '',
                    isLocked: false,
                    condition: true,
                    title: '',
                    children: [
                        {
                            componentName: 'WTable',
                            id: 'fTable1',
                            ref: 'fTable1',
                            props: {
                                columns: [
                                    {
                                        prop: 'date',
                                        label: '日期',
                                    },
                                    {
                                        prop: 'name',
                                        label: '姓名',
                                    },
                                    {
                                        prop: 'address',
                                        label: '地址',
                                    },
                                ],
                                data: [
                                    {
                                        date: '2016-05-01',
                                        name: '王小虎',
                                        address: '上海市普陀区金沙江路 1516 弄',
                                    },
                                    {
                                        date: '2016-05-02',
                                        name: '王小虎',
                                        address: '上海市普陀区金沙江路 1516 弄',
                                    },
                                    {
                                        date: '2016-05-03',
                                        name: '王小虎',
                                        address: '上海市普陀区金沙江路 1516 弄',
                                    },
                                ],
                                pagination: {
                                    type: 'JSExpression',
                                    value: '\n            {\n                ...productQueryByPagePager.value,\n                totalCount: productQueryByPage.data?.page?.totalCount\n            }\n            ',
                                },
                            },
                            isLocked: false,
                            condition: true,
                            title: '',
                        },
                    ],
                    code: {
                        directories: [],
                        code: [
                            {
                                id: 'searchParams',
                                type: 'temporaryState',
                                initValue: '{\n        \n    }',
                            },
                            {
                                id: 'productQueryByPage',
                                type: 'query',
                                runCondition: 'manual',
                                resourceType: 'rest',
                                api: '/product/queryByPage',
                                method: 'POST',
                                params: '\n        {\n            \n    \n    ...searchParams.value,\n    \n    \n            page: productQueryByPagePager.value,\n        }\n        ',
                                transformer: '\n        data.data.result.products = data.data.result.products.map(item => ({\n          ...item,\n            \n        }))\n        return data.data.result;\n        ',
                                enableTransformer: true,
                                query: '',
                                runWhenPageLoads: true,
                            },
                            {
                                id: 'productQueryByPagePager',
                                type: 'temporaryState',
                                initValue: '{\n                    currentPage: 1,\n                    pageSize: 10\n                } \n                ',
                            },
                        ],
                    },
                });
            // project.openDocument();
            project.setConfig({
                mainAppState: {
                    a: 1,
                    // eslint-disable-next-line no-new-func
                    b: new Function('return function name(params) {\n  return 3\n}')(),
                },
            });
            console.log(project);
        };

        return {
            options: {
                vueRuntimeUrl:
                    'https://registry.npmmirror.com/vue/latest/files/dist/vue.global.js',
                simulatorUrl: [
                    'https://lf1-cdn-tos.bytegoofy.com/obj/iconpark/svg_25753_22.ce2d9ec2f0a0485d535c374cb4d448a5.js',
                    `${process.env.FES_APP_SIMULATOR_PATH}/index.umd.js`,
                    `${process.env.FES_APP_SIMULATOR_PATH}/style.css`,
                ],
                letgoRequest: createRequest({
                    mode: 'cors',
                    credentials: 'same-origin',
                    requestInterceptor(config) {
                        return config;
                    },
                }),
            },
            onReady,
        };
    },
});
</script>

<template>
  <LetgoEngine class="engine" :options="options" :on-ready="onReady" />
</template>

<style>
.engine {
    width: 100%;
    height: 100%;
}
</style>
