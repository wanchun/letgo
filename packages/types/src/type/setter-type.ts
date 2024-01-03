import type { IPublicTypeSetterConfig } from '..';

// if *string* passed must be a registered IPublicTypeSetter Name, future support blockSchema
export type IPublicTypeSetterType = IPublicTypeSetterConfig | string | Array<string | IPublicTypeSetterConfig>;
