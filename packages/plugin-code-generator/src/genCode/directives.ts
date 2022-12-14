import { Directive, CompositeValue, isJSExpression } from '@webank/letgo-types';

function compileArg(arg?: CompositeValue) {
    if (arg) {
        if (isJSExpression(arg)) {
            return `:[${arg.value}]`;
        }
        return `:${arg}`;
    }
    return '';
}

function compileModifiers(modifiers?: string[]) {
    if (modifiers) {
        return modifiers.join('.');
    }

    return '';
}

function compileValue(value?: CompositeValue) {
    if (value) {
        if (isJSExpression(value)) {
            return `="${value.value}"`;
        }
        return `="${value}"`;
    }
    return '';
}

export function compileDirectives(directives?: Directive[]): string[] {
    if (!directives) return [];

    return directives.map((directive) => {
        return `${directive.name}${compileArg(directive.arg)}${compileModifiers(
            directive.modifiers,
        )}${compileValue(directive.value)}`;
    });
}
