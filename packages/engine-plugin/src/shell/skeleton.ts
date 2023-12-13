import type {
    IUnionConfig,
    Skeleton as InnerSkeleton,
    ReturnTypeOfCreateWidget,
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
    add<T extends IUnionConfig>(
        config: T,
        extraConfig?: Record<string, any>,
    ) {
        return this[skeletonSymbol].add(
            config,
            extraConfig,
        ) as ReturnTypeOfCreateWidget<T>;
    }

    /**
     * 移除一个面板实例
     * @param config
     * @returns
     */
    remove(config: IUnionConfig) {
        const { area, name } = config;
        const skeleton = this[skeletonSymbol];
        skeleton[area].remove(name);
    }
}
