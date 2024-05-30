import { IEnumEventHandlerAction, type IEventHandler, type IPublicModelProject } from '@webank/letgo-types';
import { isEmpty, isFunction, isPlainObject } from 'lodash-es';
import { computed } from 'vue';

function pickFuncFromObj(data: Record<string, any>, parent: string[] = []) {
    let funcs: string[] = [];
    for (const key of Object.keys(data)) {
        if (key.startsWith('__'))
            continue;

        if (isFunction(data[key]))
            funcs.push([...parent, key].join('.'));

        if (isPlainObject(data[key]) && parent.length < 2)
            funcs = funcs.concat(pickFuncFromObj(data[key], parent.concat(key)));
    }
    return funcs;
}

export function useStateOptions(props: {
    isGlobal: boolean;
    project: IPublicModelProject;
    componentEvent: IEventHandler;
}) {
    const queryOptions = computed(() => {
        const globalQueries = props.project.code.queries.map((item) => {
            return {
                label: item.id,
                value: item.id,
            };
        });
        if (props.isGlobal)
            return globalQueries;

        return globalQueries.concat(props.project.currentDocument.code.queries.map((item) => {
            return {
                label: item.id,
                value: item.id,
            };
        }));
    });

    const componentInstanceOptions = computed(() => {
        if (props.isGlobal)
            return [];

        const instances = props.project.currentDocument.state.componentsInstance;
        return Object.keys(instances).filter(key => !Array.isArray(instances[key]) && !isEmpty(instances[key])).map((key) => {
            return {
                label: key,
                value: key,
            };
        });
    });

    const componentMethods = computed<{ label: string; value: string }[]>(() => {
        if (props.isGlobal)
            return [];

        if (props.componentEvent.action === IEnumEventHandlerAction.CONTROL_COMPONENT && props.componentEvent.namespace) {
            const componentName = props.project.currentDocument.state.componentsInstance[props.componentEvent.namespace].__componentName;
            const metadata = props.project.currentDocument.getComponentMeta(componentName).getMetadata();
            return (metadata.configure?.supports?.methods || []).map((item) => {
                if (typeof item === 'string') {
                    return {
                        label: item,
                        value: item,
                    };
                }
                return {
                    label: item.name,
                    value: item.name,
                };
            });
        }
        return [];
    });

    const variableOptions = computed(() => {
        const globalVariables = props.project.code.temporaryStates.map((item) => {
            return {
                label: item.id,
                value: item.id,
            };
        });
        if (props.isGlobal)
            return globalVariables;

        return globalVariables.concat(props.project.currentDocument.code.temporaryStates.map((item) => {
            return {
                label: item.id,
                value: item.id,
            };
        }));
    });

    const contextFuncs = computed(() => {
        const extraGlobalState = props.project.extraGlobalState;
        const utilsFunc = pickFuncFromObj(extraGlobalState.$utils, ['$utils']);
        const contextFuncs = pickFuncFromObj(extraGlobalState.$context, ['$context']);

        return utilsFunc.concat(contextFuncs).map((item) => {
            return {
                label: item,
                value: item,
            };
        });
    });
    const globalFunction = computed(() => {
        return props.project.code.functions.map((item) => {
            return {
                label: item.id,
                value: item.id,
            };
        });
    });
    const functionOptions = computed(() => {
        if (props.isGlobal)
            return globalFunction.value.concat(contextFuncs.value);

        return props.project.currentDocument.code.functions.map((item) => {
            return {
                label: item.id,
                value: item.id,
            };
        }).concat(globalFunction.value).concat(contextFuncs.value);
    });

    return {
        queryOptions,
        variableOptions,
        functionOptions,
        componentInstanceOptions,
        componentMethods,
    };
}
