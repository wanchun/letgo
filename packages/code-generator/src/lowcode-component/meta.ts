import { merge } from 'lodash-es';
import type {
    IPublicTypeRootSchema,
} from '@webank/letgo-types';
import type { FileStruct, FileTree } from '../common/types';
import { compNameToFileName, genComponentName } from './file-name';
import type { PropDefine } from './gen-props';
import { normalizeProp } from './helper';

const ENTRY_TPL = `
import { name, version } from '../package.json';
import * as componentsMeta from './meta';

export default {
    packages: [
        {
            package: name,
            version,
            urls: [\`/material/\${name}@\${version}/index.js\`],
            library: 'LIBRARY',
        },
    ],
    components: Object.keys(componentsMeta).map((key) => componentsMeta[key]),
    sort: {
        groupList: ['低代码组件'],
    },
};
`;

export function genComponentMetaEntry(filesStruct: FileStruct[], fileTree: FileTree) {
    const metaExports: string[] = [];
    for (const fileStruct of filesStruct) {
        const fileName = compNameToFileName(fileStruct.fileName);
        const compName = genComponentName(fileStruct.fileName);
        const metaName = `${compName}Meta`;
        metaExports.push(`export { ${metaName} } from './components/${fileName}/index.meta'`);
    }

    merge(fileTree, {
        src: {
            'meta.js': metaExports.join(';\n'),
            'index.meta.js': ENTRY_TPL.replace('LIBRARY', genComponentName(filesStruct[0].rawFileName || 'lg-comp')),
        },
    });
}

const TYPE_TO_SETTER = {
    string: ['StringSetter'],
    number: ['NumberSetter'],
    boolean: ['BoolSetter'],
    object: ['ObjectSetter'],
    array: ['ArraySetter'],
    function: ['FunctionSetter'],
};

function propsTransformToMeta(props: PropDefine[], defaultProps: Record<string, any> = {}): string {
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
            if (item.arrayItemType === 'object') {
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

export function genComponentMeta(fileStruct: FileStruct, rootSchema: IPublicTypeRootSchema) {
    const compName = genComponentName(fileStruct.fileName);
    const metaName = `${compName}Meta`;

    const { props, defaultProps = {} } = rootSchema;

    const compTitle = props.title || '低代码组件';

    return `
    export const ${metaName} = {
        title: '${compTitle}',
        componentName: '${compName}',
        npm: {
            package: '',
            version: '',
            exportName: '${compName}',
            destructuring: true,
        },
        configure: {
            props: [${propsTransformToMeta((props.propsDefinition || []) as unknown as PropDefine[], defaultProps)}]
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
        group: '低代码组件',
    }
    `;
}
