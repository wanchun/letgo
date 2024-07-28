import type { IPublicModelProject } from '@webank/letgo-types';
import { createSharedComposable } from '@vueuse/core';
import { isEmpty } from 'lodash-es';
import { computed } from 'vue';
import { valueToType } from '@webank/letgo-common';

export function useGlobalCodeType(project: IPublicModelProject) {
    const globalCodeType = computed(() => {
        return {
            path: 'global-code.d.ts',
            code: `
        ${Object.keys(project.codesInstance).map((key) => {
            return `declare const ${key}: ${valueToType(project.codesInstance[key as keyof typeof project.codesInstance])};`;
        }).join('\n')}
        ${Object.keys(project.extraGlobalState).map((key) => {
            return `declare const ${key}: ${valueToType(project.extraGlobalState[key as keyof typeof project.extraGlobalState])};`;
        }).join('\n')}
        `,
        };
    });
    return globalCodeType;
}

export const useSharedGlobalCodeType = createSharedComposable(useGlobalCodeType);

export function usePageCodeType(project: IPublicModelProject) {
    const pageCodeType = computed(() => {
        const documentModel = project.currentDocument;
        const codeInstances = documentModel.state.codesInstance;
        const refs = documentModel.state.codesInstance;
        return {
            path: 'page-code.d.ts',
            code: `
        ${Object.keys(codeInstances).map((key) => {
            return `declare const ${key}: ${valueToType(codeInstances[key as keyof typeof codeInstances])};`;
        }).join('\n')}
        ${Object.keys(refs).map((key) => {
            return `declare const ${key}: ${valueToType(refs[key as keyof typeof refs], 2)};`;
        }).join('\n')}
        `,
        };
    });
    return pageCodeType;
}

export const useSharedPageCodeType = createSharedComposable(usePageCodeType);

export function usePageClassType(project: IPublicModelProject) {
    const pageCodeType = computed(() => {
        const documentModel = project.currentDocument;
        const codeInstances = documentModel.state.codesInstance.this;
        const refs = documentModel.state.codesInstance;
        return {
            path: 'page-code.d.ts',
            code: `
        ${Object.keys(codeInstances).map((key) => {
            return `declare const ${key}: ${valueToType(codeInstances[key as keyof typeof codeInstances])};`;
        }).join('\n')}
        ${Object.keys(refs).map((key) => {
            return `declare const ${key}: ${valueToType(refs[key as keyof typeof refs], 2)};`;
        }).join('\n')}
        `,
        };
    });
    return pageCodeType;
}

export const useSharedPageClassType = createSharedComposable(usePageClassType);

// scope this props
export function useCodeHintTs(props: {
    compRef?: string;
    isGlobal?: boolean;
    project?: IPublicModelProject;
}) {
    const hints = computed(() => {
        if (props.project) {
            if (props.isGlobal) {
                return {
                    codesInstance: props.project.codesInstance,
                    ...props.project.extraGlobalState,
                };
            }
            const currentDocument = props.project.currentDocument;
            const state = currentDocument.state;
            const scope = props.compRef ? currentDocument.state.getCompScope(props.compRef) : {};
            return {
                codesInstance: Object.assign({}, state?.codesInstance, props.project.codesInstance),
                componentsInstance: state
                    ? Object.keys(state.componentsInstance || {}).reduce((acc, cur) => {
                        const val = state.componentsInstance[cur];
                        if (isEmpty(val) || Array.isArray(val))
                            return acc;

                        acc[cur] = val;
                        return acc;
                    }, {} as Record<string, any>)
                    : {},
                props: state?.props,
                scope,
                ...props.project.extraGlobalState,
            };
        }
        else {
            return {};
        }
    });
    return hints;
}
