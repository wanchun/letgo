import { computed } from 'vue';
import { capitalize } from 'lodash-es';
import { getVarType } from '@webank/letgo-common';
import type { IPublicModelDocumentModel } from '@webank/letgo-types';
import type { HintPathType } from './types';

export function useHint(props: {
    hints?: Record<string, any>
    documentModel?: IPublicModelDocumentModel
}) {
    const hints = computed(() => {
        if (props.hints) {
            return props.hints;
        }
        else if (props.documentModel?.state) {
            const currentDocument = props.documentModel;
            const state = currentDocument.state;
            return {
                codesInstance: Object.assign({}, state?.codesInstance, currentDocument.project.codesInstance),
                componentsInstance: state?.componentsInstance,
                ...currentDocument.project.extraGlobalState,
            };
        }
        else {
            return {};
        }
    });
    const hintOptions = computed(() => {
        const { codesInstance, componentsInstance, ...otherState } = hints.value;
        const result: HintPathType[] = [];
        Object.keys(codesInstance || {}).forEach((key) => {
            result.push({
                label: key,
                detail: capitalize(codesInstance[key].type),
                type: 'variable',
                value: codesInstance[key].hint || codesInstance[key].view,
            });
        });

        Object.keys(componentsInstance || {}).forEach((key) => {
            result.push({
                label: key,
                detail: 'Component',
                type: 'variable',
                value: componentsInstance[key],
            });
        });

        Object.keys(otherState).forEach((key) => {
            result.push({
                label: key,
                detail: getVarType(otherState[key as keyof typeof otherState]),
                type: 'variable',
                value: otherState[key as keyof typeof otherState],
            });
        });

        return result;
    });

    return {
        hintOptions,
    };
}
