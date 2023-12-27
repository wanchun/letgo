import type {
    IPublicTypeAsset,
    IPublicTypeDevice,
    IPublicTypeDeviceStyleProps,
    IPublicTypePackage,
    IPublicTypeUtilItem,
} from '..';

export interface IPublicTypeSimulatorProps {
    designMode?: 'live' | 'design' | 'preview' | 'extend' | 'border'
    device?: IPublicTypeDevice
    deviceStyle?: IPublicTypeDeviceStyleProps
    deviceClassName?: string
    library?: IPublicTypePackage[]
    utilsMetadata?: IPublicTypeUtilItem[]
    simulatorUrl?: IPublicTypeAsset
    [key: string]: any
}
