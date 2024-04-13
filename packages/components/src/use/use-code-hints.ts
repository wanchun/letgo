import type { IPublicModelProject } from '@webank/letgo-types';
import { isEmpty } from 'lodash-es';
import { computed } from 'vue';

export function useCodeHints(props: {
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
