import { IPublicEnumJSType, type IPublicTypeComponentSchema, type IPublicTypeProjectSchema } from '@webank/letgo-types';
import type { LowCodeComponentOptions } from '../common/types';
import { genComponentName } from './file-name';
import { normalizeProp } from './helper';

const TYPE_TO_SETTER = {
    String: ['StringSetter'],
    Number: ['NumberSetter'],
    Boolean: ['BoolSetter'],
    Object: ['ObjectSetter'],
    Array: ['ArraySetter'],
    Function: ['FunctionSetter'],
};

function propsTransformToMeta(props: IPublicTypeComponentSchema['definedProps'], defaultProps: Record<string, any> = {}): string {
    return props.map((item) => {
        const setter = item.propSetter || 'StringSetter';
        if (['RadioGroupSetter', 'SelectSetter'].includes(setter)) {
            return `{
                name: '${item.name}',
                title: '${item.title}',
                setter: {
                    componentName: '${setter}',
                    props: {
                        options: [
                            ${(item.items || []).filter(Boolean).map((option) => {
                                return `
                                {
                                    label: '${option.label}',
                                    value: ${normalizeProp(option.value)}
                                }`;
                            }).join(',')}
                        ],
                    }
                },
                ${defaultProps[item.name] != null ? `defaultValue: ${normalizeProp(defaultProps[item.name])}` : ''}
            }
            `;
        }
        else if (setter === 'ObjectSetter') {
            return `{
                name: '${item.name}',
                title: '${item.title}',
                setter: {
                    componentName: '${setter}',
                    props: {
                        items: [${propsTransformToMeta((item.objectItems || []))}]
                    }
                },
            }
            `;
        }
        else if (setter === 'ArraySetter') {
            if (item.arrayItemType === IPublicEnumJSType.Object) {
                return `{
                    name: '${item.name}',
                    title: '${item.title}',
                    setter: {
                        componentName: '${setter}',
                        props: {
                            itemSetter: {
                                componentName: 'ObjectSetter',
                                props: {
                                    items: [${propsTransformToMeta((item.arrayItems || []))}]
                                }
                            },
                            columns: [${(item.arrayItems || []).slice(0, 2).map(item => `'${item.name}'`).join(', ')}]
                        }
                    }
                }
                `;
            }
            return `{
                name: '${item.name}',
                title: '${item.title}',
                setter: {
                    componentName: '${setter}',
                    props: {
                        itemSetter: '${TYPE_TO_SETTER[item.arrayItemType][0]}'
                    }
                }
            }
            `;
        }
        else {
            return `{
                name: '${item.name}',
                title: '${item.title}',
                setter: '${setter}',
                ${defaultProps[item.name] != null ? `defaultValue: ${normalizeProp(defaultProps[item.name])}` : ''}
            }
            `;
        }
    }).join(',\n');
}

export function genComponentMeta(schema: IPublicTypeProjectSchema, options: LowCodeComponentOptions) {
    const rootSchema = schema.componentsTree[0] as IPublicTypeComponentSchema;
    const compName = genComponentName(rootSchema.fileName);

    const { title, definedProps, defaultProps = {} } = rootSchema;

    const compTitle = title || compName;

    const library = options.pkgName;

    return `
    window.${library}Meta =  {
        packages: [
            ${schema.packages.map((item) => {
                return JSON.stringify(item);
            }).join(',')}
            ${schema.packages.length ? ',' : ''}
            {
                title: '${compTitle}',
                id: '${rootSchema.id}',
                version: '${options.extraPackageJSON.version}',
                type: 'lowCode',
                schema: {
                    utils: ${JSON.stringify(schema.utils || [])}, 
                    componentsMap: ${JSON.stringify(schema.componentsMap)},
                    componentsTree: [
                        {
                            id: '${rootSchema.id}',
                            componentName: '${rootSchema.componentName}',
                            props: ${JSON.stringify(defaultProps)},
                            fileName: '${rootSchema.fileName}',
                            code: ${JSON.stringify(rootSchema.code)},
                            title: '${compTitle}',
                            children: ${JSON.stringify(rootSchema.children)},
                            definedProps: ${JSON.stringify(rootSchema.definedProps || [])},
                        }
                    ]
                },
                library: '${compName}',
            },
        ],
        components: [
            {
                title: '${compTitle}',
                componentName: '${compName}',
                reference: {
                    id: '${rootSchema.id}',
                    version: '${options.extraPackageJSON.version}',
                    subName: '',
                    exportName: '${compName}',
                    destructuring: false,
                },
                devMode: 'lowCode',
                configure: {
                    supports: {
                        style: true
                    },
                    props: [${propsTransformToMeta((definedProps || []), defaultProps)}]
                },
                sippets: [
                    {
                        title: '${compTitle}',
                        schema: {
                            componentName: '${compName}',
                            props: {}
                        }
                    }
                ],
                category: '${options.category || '组件'}',
                group: '${options.group || '低代码组件'}',
                priority: ${options.priority || 0}
            }
        ],
        sort: {
            groupList: ['${options.group || '低代码组件'}'],
            categoryList: ['${options.category || '组件'}']
        },
    };
    `;
}
