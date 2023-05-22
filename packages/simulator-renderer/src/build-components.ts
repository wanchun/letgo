import type { Component } from 'vue';
import { defineComponent, h } from 'vue';
import { isFunction, isObject } from 'lodash-es';
import type { IPublicTypeComponentSchema, IPublicTypeNpmInfo } from '@webank/letgo-types';
import { isESModule } from './utils';

export function isVueComponent(val: unknown): val is Component {
    if (isFunction(val))
        return true;
    if (isObject(val) && ('render' in val || 'setup' in val))
        return true;

    return false;
}

export function isComponentSchema(val: unknown) {
    return (
        isObject(val) && (val as IPublicTypeComponentSchema).componentName === 'Component'
    );
}

export function accessLibrary(library: string | Record<string, unknown>) {
    if (typeof library !== 'string')
        return library;

    return (window as any)[library] || generateHtmlComp(library);
}

export function generateHtmlComp(library: string) {
    if (['a', 'img', 'div', 'span', 'svg'].includes(library)) {
        return defineComponent((_, { attrs, slots }) => {
            return () => h(library, attrs, slots);
        });
    }
}

export function getSubComponent(library: any, paths: string[]) {
    const l = paths.length;
    if (l < 1 || !library)
        return library;

    let i = 0;
    let component: any;
    while (i < l) {
        const key = paths[i]!;
        let ex: any;
        try {
            component = library[key];
        }
        catch (e) {
            ex = e;
            component = null;
        }
        if (i === 0 && component == null && key === 'default') {
            if (ex)
                return l === 1 ? library : null;

            component = library;
        }
        else if (component == null) {
            return null;
        }
        library = component;
        i++;
    }
    return component;
}

export function findComponent(
    libraryMap: Record<string, string>,
    componentName: string,
    npm?: IPublicTypeNpmInfo,
) {
    if (!npm)
        return accessLibrary(componentName);

    const exportName = npm.exportName || npm.componentName || componentName;
    const libraryName = libraryMap[npm.package] || exportName;
    const library = accessLibrary(libraryName);
    const paths = (npm.exportName && npm.subName) ? npm.subName.split('.') : [];
    if (npm.destructuring)
        paths.unshift(exportName);

    else if (isESModule(library))
        paths.unshift('default');

    return getSubComponent(library, paths);
}

export function buildComponents(
    libraryMap: Record<string, string>,
    componentsMap: Record<string, IPublicTypeNpmInfo | Component | IPublicTypeComponentSchema>,
    createComponent?: (schema: IPublicTypeComponentSchema) => Component | null,
) {
    const components: any = {};
    Object.keys(componentsMap).forEach((componentName) => {
        let component = componentsMap[componentName];
        if (isComponentSchema(component)) {
            if (createComponent) {
                components[componentName] = createComponent(
                    component as IPublicTypeComponentSchema,
                );
            }
        }
        else if (isVueComponent(component)) {
            components[componentName] = component;
        }
        else {
            component = findComponent(
                libraryMap,
                componentName,
                component as IPublicTypeNpmInfo,
            );
            if (component)
                components[componentName] = component;
        }
    });
    return components;
}
