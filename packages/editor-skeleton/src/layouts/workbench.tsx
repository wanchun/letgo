import { defineComponent, PropType } from 'vue';
import { Skeleton } from '../skeleton';
import TopArea from './top-area';
import LeftArea from './left-area';
import LeftFloatArea from './left-float-area';
import LeftFixedArea from './left-fixed-area';
import Toolbar from './toolbar';
import MainArea from './main-area';
import BottomArea from './bottom-area';
import RightArea from './right-area';
import GlobalArea from './global-area';
import './workbench.less';

export default defineComponent({
    props: {
        skeleton: {
            type: Object as PropType<Skeleton>,
        },
    },
    setup(props) {
        return () => {
            return (
                <div class={'letgo-workbench'}>
                    <TopArea area={props.skeleton.topArea} />
                    <div className="letgo-workbench-body">
                        <LeftArea area={props.skeleton.leftArea} />
                        <LeftFloatArea />
                        <LeftFixedArea />
                        <div className="letgo-workbench-center">
                            <Toolbar />
                            <MainArea />
                            <BottomArea />
                        </div>
                        <RightArea />
                    </div>
                    <GlobalArea area={props.skeleton.globalArea} />
                </div>
            );
        };
    },
});
