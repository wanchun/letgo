import type { IPublicTypeAppLayout, IPublicTypeAppTheme } from '..';

export interface IPublicTypeAppConfig {
    sdkVersion?: string
    historyMode?: string
    targetRootID?: string
    layout?: IPublicTypeAppLayout
    theme?: IPublicTypeAppTheme
    [key: string]: any
}
