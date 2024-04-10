import type { IPublicTypeComponentSchema, IPublicTypeProjectSchema } from '@webank/letgo-types';
import { Renderer } from './renderer';

export function createComponent(schema: IPublicTypeProjectSchema<IPublicTypeComponentSchema>) {
    const componentsTreeSchema = schema.componentsTree[0];

    return (props: Record<string, any>) => {
        return <Renderer schema={componentsTreeSchema} extraProps={{ ...props }}></Renderer>;
    };
}
