import type { IPublicTypeCompositeValue } from '../..';

export interface IPublicTypeDirective {
    name: string
    value: IPublicTypeCompositeValue
    arg?: IPublicTypeCompositeValue
    modifiers: string[]
}
