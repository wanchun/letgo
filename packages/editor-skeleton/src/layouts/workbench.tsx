import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { Skeleton } from '../skeleton';
import TopArea from './top-area';
import LeftArea from './left-area';
import LeftFloatArea from './left-float-area';
import Toolbar from './toolbar';
import MainArea from './main-area';
import BottomArea from './bottom-area';
import RightArea from './right-area';
import './workbench.less';

export default defineComponent({
    name: 'WorkBench',
    props: {
        skeleton: {
            type: Object as PropType<Skeleton>,
        },
    },
    setup(props) {
        return () => {
            const { skeleton } = props;
            return (
                <div class="letgo-skeleton-workbench">
                    <TopArea area={skeleton.topArea} />
                    <div class="letgo-skeleton-workbench__body">
                        <LeftArea area={skeleton.leftArea} />
                        <LeftFloatArea area={skeleton.leftFloatArea} />
                        <div class="letgo-skeleton-workbench__center">
                            <Toolbar area={skeleton.toolbarArea} />
                            <MainArea area={skeleton.mainArea} />
                        </div>
                        <RightArea area={skeleton.rightArea} />
                    </div>
                    <BottomArea area={skeleton.bottomArea} />
                </div>
            );
        };
    },
});
