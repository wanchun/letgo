import { camelCase, kebabCase } from 'lodash-es';

export function formatFileName(name: string) {
    return name.trim().replace(/\.\w+$/, '');
}

export function compNameToFileName(fileName: string) {
    return kebabCase(formatFileName(fileName));
}

function capitalizeFirstLetter(compName: string) {
    return compName.charAt(0).toUpperCase() + compName.slice(1);
}

export function genComponentName(fileName: string) {
    return capitalizeFirstLetter(camelCase(formatFileName(fileName)));
}
