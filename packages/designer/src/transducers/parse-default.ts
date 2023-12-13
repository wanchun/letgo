import type { IPublicTypeTransformedComponentMetadata } from '@webank/letgo-types';

export default function componentDefaults(
    metadata: IPublicTypeTransformedComponentMetadata,
): IPublicTypeTransformedComponentMetadata {
    const { configure = {}, componentName } = metadata;
    const { component = {} } = configure;
    if (!component.nestingRule) {
        let m;
        // uri match xx.Group set subcontrolling: true, childWhiteList
        if ((/^(.+)\Group$/.test(componentName))) {
            m = /^(.+)\Group$/.exec(componentName);
            // component.subControlling = true;
            component.nestingRule = {
                childWhitelist: [`${m[1]}`],
            };
        }
        else if ((/^(.+)(Item|Node|Option)$/.test(componentName))) {
            m = /^(.+)(Item|Node|Option)$/.exec(componentName);
            // uri match .Item .Node .Option set parentWhiteList
            component.nestingRule = {
                parentWhitelist: [`${m[1]}`],
            };
        }
    }
    if (component.isModal === null && /(Modal|Drawer)/.test(componentName))
        component.isModal = true;

    return {
        ...metadata,
        configure: {
            ...configure,
            component,
        },
    };
}
