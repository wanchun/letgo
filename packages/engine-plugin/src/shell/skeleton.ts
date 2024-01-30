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

    get leftArea() {
        return this[skeletonSymbol].leftArea;
    }

    get topArea() {
        return this[skeletonSymbol].topArea;
    }

    get toolbarArea() {
        return this[skeletonSymbol].toolbarArea;
    }

    get bottomArea() {
        return this[skeletonSymbol].bottomArea;
    }

    get globalArea() {
        return this[skeletonSymbol].globalArea;
    }

    get rightArea() {
        return this[skeletonSymbol].rightArea;
    }

    get leftFloatArea() {
        return this[skeletonSymbol].leftFloatArea;
    }

    get mainArea() {
        return this[skeletonSymbol].mainArea;
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
     */
    remove(config: IUnionConfig) {
        const { area, name } = config;
        const skeleton = this[skeletonSymbol];
        skeleton[area].remove(name);
    }
}
