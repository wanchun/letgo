import type {
    IPublicTypeAsset,
    IPublicTypeDevice,
    IPublicTypeDeviceStyleProps,
    IPublicTypePackage,
} from '..';

export interface IPublicTypeSimulatorProps {
    designMode?: 'live' | 'design' | 'preview' | 'extend' | 'border';
    device?: IPublicTypeDevice;
    deviceStyle?: IPublicTypeDeviceStyleProps;
    deviceClassName?: string;
    library?: IPublicTypePackage[];
    simulatorUrl?: IPublicTypeAsset;
    [key: string]: any;
}
