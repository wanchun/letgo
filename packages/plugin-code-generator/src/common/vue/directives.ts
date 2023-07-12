import type { IPublicTypeCompositeValue, IPublicTypeDirective } from '@harrywan/letgo-types';
import { isJSExpression } from '@harrywan/letgo-types';

function compileArg(arg?: IPublicTypeCompositeValue) {
    if (arg) {
        if (isJSExpression(arg))
            return `:[${arg.value}]`;

        return `:${arg}`;
    }
    return '';
}

function compileModifiers(modifiers?: string[]) {
    if (modifiers)
        return modifiers.join('.');

    return '';
}

function compileValue(value?: IPublicTypeCompositeValue) {
    if (value) {
        if (isJSExpression(value))
            return `="${value.value}"`;

        return `="${value}"`;
    }
    return '';
}

export function compileDirectives(directives?: IPublicTypeDirective[]): string[] {
    if (!directives)
        return [];

    return directives.map((directive) => {
        return `${directive.name}${compileArg(directive.arg)}${compileModifiers(
            directive.modifiers,
        )}${compileValue(directive.value)}`;
    });
}
