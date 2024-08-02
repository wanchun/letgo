import { defineRuntimeConfig } from '@fesjs/fes';
import { FConfigProvider } from '@fesjs/fes-design';

// const injectGroup: IPublicTypeFieldConfig = {
//     name: 'action',
//     title: '权限',
//     type: 'group',
//     extraProps: {
//         display: 'block',
//     },
//     items: [
//         {
//             name: 'v-access',
//             title: '资源ID',
//             setter: 'StringSetter',
//             defaultValue: '',
//             supportVariable: false,
//         },
//     ],
// };
// registerMetadataTransducer((metadata) => {
//     if (metadata.configure)
//         metadata.configure.props.push(injectGroup);
//     return metadata;
// }, 100, 'inject-custom');

export default defineRuntimeConfig({
    rootContainer(Container: any) {
        return () => {
            return (
                <FConfigProvider>
                    <Container />
                </FConfigProvider>
            );
        };
    },
});
