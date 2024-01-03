import type { IPublicModelSettingField } from '..';

export type IPublicTypeDynamicSetterProps = (target: IPublicModelSettingField) => Record<string, unknown>;
