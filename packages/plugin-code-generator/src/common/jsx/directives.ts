import type { IPublicTypeCompositeValue, IPublicTypeDirective } from '@fesjs/letgo-types';
import { isJSExpression } from '@fesjs/letgo-types';

function getCompileArg(arg?: IPublicTypeCompositeValue) {
    if (arg) {
        if (isJSExpression(arg))
            return arg.value;

        return arg;
    }
    return '';
}

function getModifiers(modifiers?: string[]) {
    if (modifiers)
        return modifiers.join('.');

    return '';
}

function getDirectiveValue(value?: IPublicTypeCompositeValue) {
    if (value) {
        if (isJSExpression(value))
            return `={${value.value}}`;

        return `={${value}}`;
    }
    return '';
}

export function compileDirectives(directives?: IPublicTypeDirective[]): string[] {
    if (!directives)
        return [];

    return directives.map((directive) => {
        const arg = getCompileArg(directive.arg);
        let value = getDirectiveValue(directive.value);
        if (arg) {
            if (directive.modifiers?.length)
                value = `[${value}, '${arg}', '${getModifiers(directive.modifiers)}']`;

            else
                value = `[${value}, '${arg}']`;
        }

        return `${directive.name}={${value}}`;
    });
}
