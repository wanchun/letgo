import type { Node, Options } from 'acorn';
import { parse } from 'acorn';
import { ancestor } from 'acorn-walk';

function isScope(node: Node) {
    return (
        node.type === 'FunctionExpression'
    || node.type === 'FunctionDeclaration'
    || node.type === 'ArrowFunctionExpression'
    || node.type === 'Program'
    );
}
function isBlockScope(node: Node) {
    return (
        node.type === 'BlockStatement'
    || node.type === 'SwitchStatement'
    || isScope(node)
    );
}

function declaresArguments(node: Node) {
    return (
        node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration'
    );
}

export function reallyParse(source: string, options?: Options) {
    const parseOptions = Object.assign(
        {
            allowReturnOutsideFunction: true,
            allowImportExportEverywhere: true,
            allowHashBang: true,
            ecmaVersion: 'latest',
        },
        options,
    );
    return parse(source, parseOptions);
}

function declarePattern(node: any, parent: any) {
    switch (node.type) {
        case 'Identifier':
            parent.locals[node.name] = true;
            break;
        case 'ObjectPattern':
            node.properties.forEach((node: any) => {
                declarePattern(node.value || node.argument, parent);
            });
            break;
        case 'ArrayPattern':
            node.elements.forEach((node: any) => {
                if (node)
                    declarePattern(node, parent);
            });
            break;
        case 'RestElement':
            declarePattern(node.argument, parent);
            break;
        case 'AssignmentPattern':
            declarePattern(node.left, parent);
            break;
            // istanbul ignore next
        default:
            throw new Error(`Unrecognized pattern type: ${node.type}`);
    }
}

export function findGlobals(source: string | Node, options: Options = {} as Options) {
    const globals: Node[] = [];
    let ast: any;
    // istanbul ignore else
    if (typeof source === 'string')
        ast = reallyParse(source, options);

    else
        ast = source;

    // istanbul ignore if
    if (!(ast && typeof ast === 'object' && ast.type === 'Program')) {
        throw new TypeError(
            'Source must be either a string of JavaScript or an acorn AST',
        );
    }
    const declareFunction = (node: any) => {
        const fn = node;
        fn.locals = fn.locals || Object.create(null);
        node.params.forEach((node: Node) => {
            declarePattern(node, fn);
        });
        if (node.id)
            fn.locals[node.id.name] = true;
    };
    const declareClass = function (node: any) {
        node.locals = node.locals || Object.create(null);
        if (node.id)
            node.locals[node.id.name] = true;
    };

    const declareModuleSpecifier = (node: any) => {
        ast.locals = ast.locals || Object.create(null);
        ast.locals[node.local.name] = true;
    };
    ancestor(ast, {
        VariableDeclaration(node: any, parents: any) {
            let parent: any = null;
            for (let i = parents.length - 1; i >= 0 && parent === null; i--) {
                if (
                    node.kind === 'var' ? isScope(parents[i]) : isBlockScope(parents[i])
                )
                    parent = parents[i];
            }
            parent.locals = parent.locals || Object.create(null);
            node.declarations.forEach((declaration: any) => {
                declarePattern(declaration.id, parent);
            });
        },
        FunctionDeclaration(node: any, parents) {
            let parent = null;
            for (let i = parents.length - 2; i >= 0 && parent === null; i--) {
                if (isScope(parents[i]))
                    parent = parents[i];
            }
            parent.locals = parent.locals || Object.create(null);
            if (node.id)
                parent.locals[node.id.name] = true;

            declareFunction(node);
        },
        Function: declareFunction,
        ClassDeclaration(node: any, parents) {
            let parent = null;
            for (let i = parents.length - 2; i >= 0 && parent === null; i--) {
                if (isBlockScope(parents[i]))
                    parent = parents[i];
            }
            parent.locals = parent.locals || Object.create(null);
            if (node.id)
                parent.locals[node.id.name] = true;

            declareClass(node);
        },
        Class: declareClass,
        TryStatement(node: any) {
            if (node.handler === null || node.handler.param === null)
                return;
            node.handler.locals = node.handler.locals || Object.create(null);
            declarePattern(node.handler.param, node.handler);
        },
        ImportDefaultSpecifier: declareModuleSpecifier,
        ImportSpecifier: declareModuleSpecifier,
        ImportNamespaceSpecifier: declareModuleSpecifier,
    });
    function identifier(node: any, parents: any) {
        const name = node.name;
        if (name === 'undefined')
            return;
        for (let i = 0; i < parents.length; i++) {
            if (name === 'arguments' && declaresArguments(parents[i]))
                return;

            if (parents[i].locals && name in parents[i].locals)
                return;
        }
        node.parents = parents.slice();
        globals.push(node);
    }
    ancestor(ast, {
        VariablePattern: identifier,
        Identifier: identifier,
        ThisExpression(node: any, parents) {
            for (let i = 0; i < parents.length; i++) {
                const parent = parents[i];
                if (
                    parent.type === 'FunctionExpression'
          || parent.type === 'FunctionDeclaration'
                )
                    return;

                if (
                    parent.type === 'PropertyDefinition'
          && parents[i + 1] === parent.value
                )
                    return;
            }
            node.parents = parents.slice();
            globals.push(node);
        },
    });
    const groupedGlobals = Object.create(null);
    globals.forEach((node: any) => {
        const name = node.type === 'ThisExpression' ? 'this' : node.name;
        groupedGlobals[name] = groupedGlobals[name] || [];
        groupedGlobals[name].push(node);
    });
    return Object.keys(groupedGlobals)
        .sort()
        .map((name) => {
            return { name, nodes: groupedGlobals[name] };
        });
}
