import type { IPublicTypeCompositeValue, IPublicTypeDirective } from '@webank/letgo-types';
import { isJSExpression } from '@webank/letgo-types';
import { formatExpression } from '../format-expression';

function getCompileArg(arg?: IPublicTypeCompositeValue) {
    if (arg) {
        if (isJSExpression(arg))
            return formatExpression(arg);

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
            return `={${formatExpression(value)}}`;

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
        if (value && arg) {
            if (directive.modifiers?.length)
                value = `[${value}, '${arg}', '${getModifiers(directive.modifiers)}']`;

            else
                value = `[${value}, '${arg}']`;
        }
        if (value)
            return `${directive.name}={${value}}`;

        return null;
    }).filter(Boolean);
}
