import type { IPublicTypeComponentSchema, IPublicTypeNpmInfo, IPublicTypeProjectSchema } from '@webank/letgo-types';
import type { Component } from 'vue';
import { defineComponent, h } from 'vue';
import { isESModule, isLowcodeProjectSchema, isVueComponent } from './check-types';

export const HtmlCompWhitelist = ['a', 'img', 'div', 'span', 'svg', 'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label', 'ul', 'li', 'ol', 'pre', 'code', 'blockquote', 'strong', 'em', 'i', 'address', 'article', 'aside', 'details', 'footer', 'header', 'hgroup', 'main', 'nav', 'section', 'summary', 'iframe'];

export function accessLibrary(library: string | Record<string, unknown>) {
    if (typeof library !== 'string')
        return library;

    return (window as any)[library] || generateHtmlComp(library);
}

export function generateHtmlComp(library: string) {
    if (HtmlCompWhitelist.includes(library)) {
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

export function findLibExport(
    libraryMap: Record<string, string>,
    exportName: string,
    npm?: IPublicTypeNpmInfo,
) {
    if (!npm)
        return accessLibrary(exportName);

    exportName = npm.exportName || exportName;
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
    createComponent: (schema: IPublicTypeProjectSchema<IPublicTypeComponentSchema>) => Component | null,
) {
    const components: any = {};
    Object.keys(componentsMap).forEach((componentName) => {
        let component = componentsMap[componentName];
        if (isLowcodeProjectSchema(component)) {
            components[componentName] = createComponent(component);
        }
        else if (isVueComponent(component)) {
            components[componentName] = component;
        }
        else {
            component = findLibExport(
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
