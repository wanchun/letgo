import {
    Skeleton as InnerSkeleton,
    IWidgetBaseConfig,
    IWidgetConfigArea,
    IWidgetConfig,
    IWidgetModalConfig,
    IPanelProps,
} from '@webank/letgo-editor-skeleton';
import { skeletonSymbol } from './symbols';

export class Skeleton {
    private readonly [skeletonSymbol]: InnerSkeleton;

    constructor(skeleton: InnerSkeleton) {
        this[skeletonSymbol] = skeleton;
    }

    /**
     * 增加一个面板实例
     * @param config
     * @param extraConfig
     * @returns
     */
    add(
        config: IWidgetBaseConfig &
            (IWidgetConfig | IWidgetModalConfig | IPanelProps),
        extraConfig?: Record<string, any>,
    ) {
        return this[skeletonSymbol].add(config, extraConfig);
    }

    /**
     * 移除一个面板实例
     * @param config
     * @returns
     */
    remove(config: IWidgetBaseConfig) {
        const { area, name } = config;
        const skeleton = this[skeletonSymbol];
        if (!normalizeArea(area)) return;
        skeleton[normalizeArea(area)!].remove(name);
    }
}

function normalizeArea(area: IWidgetConfigArea | undefined) {
    switch (area) {
        case 'leftArea':
        case 'left':
            return 'leftArea';
        case 'globalArea':
        case 'global':
            return 'globalArea';
        case 'rightArea':
        case 'right':
            return 'rightArea';
        case 'topArea':
        case 'top':
            return 'topArea';
        case 'toolbar':
            return 'toolbar';
        case 'mainArea':
        case 'main':
        case 'center':
        case 'centerArea':
            return 'mainArea';
        case 'bottomArea':
        case 'bottom':
            return 'bottomArea';
        case 'leftFixedArea':
            return 'leftFixedArea';
        case 'leftFloatArea':
            return 'leftFloatArea';
        default:
            throw new Error(`${area} not supported`);
    }
}
