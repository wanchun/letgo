import { defineComponent } from 'vue';
import TopArea from './top-area';
import LeftArea from './left-area';
import LeftFloatArea from './left-float-area';
import LeftFixedArea from './left-fixed-area';
import Toolbar from './toolbar';
import MainArea from './main-area';
import BottomArea from './bottom-area';
import RightArea from './right-area';
import './workbench.less';

export default defineComponent({
    setup() {
        return () => {
            return (
                <div class={'letgo-workbench'}>
                    <TopArea />
                    <div className="letgo-workbench-body">
                        <LeftArea />
                        <LeftFloatArea />
                        <LeftFixedArea />
                        <div className="letgo-workbench-center">
                            <Toolbar />
                            <MainArea />
                            <BottomArea />
                        </div>
                        <RightArea />
                    </div>
                </div>
            );
        };
    },
});
