import type { IPublicEnumPropValueChanged } from '../enum';

export interface IPublicTypeSetValueOptions {
    disableMutator?: boolean
    type?: IPublicEnumPropValueChanged
    fromSetHotValue?: boolean
}
