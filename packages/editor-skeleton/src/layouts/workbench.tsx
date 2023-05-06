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
import GlobalArea from './global-area';
import {
    workbenchBodyCls,
    workbenchCenterCls,
    workbenchCls,
} from './workbench.css';

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
                <div class={workbenchCls}>
                    <TopArea area={skeleton.topArea} />
                    <div class={workbenchBodyCls}>
                        <LeftArea area={skeleton.leftArea} />
                        <LeftFloatArea area={skeleton.leftFloatArea} />
                        <div class={workbenchCenterCls}>
                            <Toolbar area={skeleton.toolbar} />
                            <MainArea area={skeleton.mainArea} />
                            <BottomArea area={skeleton.bottomArea} />
                        </div>
                        <RightArea area={skeleton.rightArea} />
                    </div>
                    <GlobalArea area={skeleton.globalArea} />
                </div>
            );
        };
    },
});
