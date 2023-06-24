import { computed } from 'vue';
import { capitalize } from 'lodash-es';
import { getVarType } from '@webank/letgo-common';
import type { DocumentModel } from '@webank/letgo-designer';
import type { HintPathType } from './types';

export function useHint(props: {
    documentModel: DocumentModel
}) {
    const hintOptions = computed(() => {
        const state = props.documentModel.state;
        const result: HintPathType[] = [];
        Object.keys(state.codesInstance || {}).forEach((key) => {
            result.push({
                label: key,
                detail: capitalize(state.codesInstance[key].type),
                type: 'variable',
                value: state.codesInstance[key].view,
            });
        });

        Object.keys(state.componentsInstance || {}).forEach((key) => {
            result.push({
                label: key,
                detail: 'Component',
                type: 'variable',
                value: state.componentsInstance[key],
            });
        });

        Object.keys(state.globalState || {}).forEach((key) => {
            result.push({
                label: key,
                detail: getVarType(state.globalState[key]),
                type: 'variable',
                value: state.globalState[key],
            });
        });

        return result;
    });

    return {
        hintOptions,
    };
}
