import type { CSSProperties, PropType, Ref } from 'vue';
import { computed, defineComponent, inject, onMounted, ref, watch } from 'vue';
import { useModel } from '@harrywan/letgo-common';
import { FCollapseItem, FGrid, FGridItem, FRadioButton, FRadioGroup, FSelect } from '@fesjs/fes-design';
import { InputColor, InputUnit, Row } from '../../../component';
import { styleKey } from '../const';
import './border.less';

enum EnumBorderType {
    All = '',
    Left = 'Left',
    Top = 'Top',
    Right = 'Right',
    Bottom = 'Bottom',
}

const borderStyleList = [
    {
        value: 'solid',
        label: '实线 solid',
    },
    {
        value: 'dashed',
        label: '方块虚线 dashed',
    },
    {
        value: 'dotted',
        label: '圆点虚线 dotted',
    },
    {
        value: 'double',
        label: '双实线 double',
    },
    {
        value: 'none',
        label: '不显示 none',
    },
];

type RadiusType = 'TopLeft' | 'TopRight' | 'BottomLeft' | 'BottomRight';

const radiusList: RadiusType[] = ['TopLeft', 'TopRight', 'BottomLeft', 'BottomRight'];

const svgList = {
    TopLeft: <svg viewBox="0 0 1024 1024"><path d="M656 200h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8z m58 624h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM192 650h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m0 174h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m696-696h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m0 174h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m0 174h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m0 174h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m0 174h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m-348 0h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m-174 0h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m174-696H358c-127 0-230 103-230 230v182c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V358c0-87.3 70.7-158 158-158h182c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z"></path></svg>,
    TopRight: <svg viewBox="0 0 1024 1024"><path d="M368 128h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m-2 696h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m522-174h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m0 174h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM192 128h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m0 174h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m0 174h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m0 174h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m0 174h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m348 0h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m174 0h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m-48-696H484c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h182c87.3 0 158 70.7 158 158v182c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V358c0-127-103-230-230-230z"></path></svg>,
    BottomLeft: <svg viewBox="0 0 1024 1024"><path d="M712 824h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m2-696h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM136 374h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8z m0-174h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8z m752 624h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m0-174h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m0-174h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m0-174h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m0-174h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m-348 0h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m-230 72h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8z m230 624H358c-87.3 0-158-70.7-158-158V484c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v182c0 127 103 230 230 230h182c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z"></path></svg>,
    BottomRight: <svg id="icon-radius-bottomright" viewBox="0 0 1024 1024"><path d="M368 824h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m-58-624h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8z m578 102h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m0-174h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM192 824h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m0-174h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m0-174h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m0-174h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m0-174h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z m292 72h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8z m174 0h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8z m230 276h-56c-4.4 0-8 3.6-8 8v182c0 87.3-70.7 158-158 158H484c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h182c127 0 230-103 230-230V484c0-4.4-3.6-8-8-8z"></path></svg>,
    BorderTop: <svg viewBox="0 0 1024 1024">
        <path d="M891.733333 665.6a21.333333 21.333333 0 0 0 21.333334-21.333333v-68.266667a21.333333 21.333333 0 1 0-42.666667 0v68.266667a21.333333 21.333333 0 0 0 21.333333 21.333333zM145.066667 746.666667v-68.266667a21.333333 21.333333 0 1 0-42.666667 0v68.266667a21.333333 21.333333 0 1 0 42.666667 0zM891.733333 512a21.333333 21.333333 0 0 0 21.333334-21.333333v-68.266667a21.333333 21.333333 0 1 0-42.666667 0v68.266667a21.333333 21.333333 0 0 0 21.333333 21.333333zM870.4 268.8v68.266667a21.333333 21.333333 0 1 0 42.666667 0v-68.266667a21.333333 21.333333 0 1 0-42.666667 0zM145.066667 439.466667v-68.266667a21.333333 21.333333 0 1 0-42.666667 0v68.266667a21.333333 21.333333 0 1 0 42.666667 0zM891.733333 819.2a21.333333 21.333333 0 0 0 21.333334-21.333333v-68.266667a21.333333 21.333333 0 1 0-42.666667 0v68.266667a21.333333 21.333333 0 0 0 21.333333 21.333333zM145.066667 593.066667v-68.266667a21.333333 21.333333 0 1 0-42.666667 0v68.266667a21.333333 21.333333 0 1 0 42.666667 0zM605.866667 900.266667a21.333333 21.333333 0 0 0-21.333334-21.333334h-68.266666a21.333333 21.333333 0 1 0 0 42.666667h68.266666a21.333333 21.333333 0 0 0 21.333334-21.333333zM759.466667 900.266667a21.333333 21.333333 0 0 0-21.333334-21.333334h-68.266666a21.333333 21.333333 0 1 0 0 42.666667h68.266666a21.333333 21.333333 0 0 0 21.333334-21.333333zM913.066667 900.266667v-17.066667a21.333333 21.333333 0 0 0-42.24-4.266667H823.466667a21.333333 21.333333 0 1 0 0 42.666667h68.266666a21.333333 21.333333 0 0 0 21.333334-21.333333zM145.066667 900.266667v-68.266667a21.333333 21.333333 0 1 0-42.666667 0v68.266667a21.333333 21.333333 0 1 0 42.666667 0zM298.666667 900.266667a21.333333 21.333333 0 0 0-21.333334-21.333334h-68.266666a21.333333 21.333333 0 1 0 0 42.666667h68.266666a21.333333 21.333333 0 0 0 21.333334-21.333333zM452.266667 900.266667a21.333333 21.333333 0 0 0-21.333334-21.333334h-68.266666a21.333333 21.333333 0 1 0 0 42.666667h68.266666a21.333333 21.333333 0 0 0 21.333334-21.333333z"></path>
        <path d="M913.066667 226.133333v-102.4a21.333333 21.333333 0 0 0-21.333334-21.333333h-768a21.333333 21.333333 0 0 0-21.333333 21.333333v162.133334a21.333333 21.333333 0 1 0 42.666667 0V247.466667h746.666666a21.333333 21.333333 0 0 0 21.333334-21.333334z"></path>
    </svg>,
    BorderLeft: <svg viewBox="0 0 1024 1024">
        <path d="M661.333333 128a21.333333 21.333333 0 0 0-21.333333-21.333333h-68.266667a21.333333 21.333333 0 1 0 0 42.666666h68.266667a21.333333 21.333333 0 0 0 21.333333-21.333333zM742.4 874.666667h-68.266667a21.333333 21.333333 0 1 0 0 42.666666h68.266667a21.333333 21.333333 0 1 0 0-42.666666zM507.733333 128a21.333333 21.333333 0 0 0-21.333333-21.333333h-68.266667a21.333333 21.333333 0 1 0 0 42.666666h68.266667a21.333333 21.333333 0 0 0 21.333333-21.333333zM264.533333 149.333333h68.266667a21.333333 21.333333 0 1 0 0-42.666666h-68.266667a21.333333 21.333333 0 1 0 0 42.666666zM435.2 874.666667h-68.266667a21.333333 21.333333 0 1 0 0 42.666666h68.266667a21.333333 21.333333 0 1 0 0-42.666666zM814.933333 128a21.333333 21.333333 0 0 0-21.333333-21.333333h-68.266667a21.333333 21.333333 0 1 0 0 42.666666h68.266667a21.333333 21.333333 0 0 0 21.333333-21.333333zM588.8 874.666667h-68.266667a21.333333 21.333333 0 1 0 0 42.666666h68.266667a21.333333 21.333333 0 1 0 0-42.666666zM896 413.866667a21.333333 21.333333 0 0 0-21.333333 21.333333v68.266667a21.333333 21.333333 0 1 0 42.666666 0v-68.266667a21.333333 21.333333 0 0 0-21.333333-21.333333zM896 260.266667a21.333333 21.333333 0 0 0-21.333333 21.333333v68.266667a21.333333 21.333333 0 1 0 42.666666 0v-68.266667a21.333333 21.333333 0 0 0-21.333333-21.333333zM896 106.666667h-17.066667a21.333333 21.333333 0 0 0-4.266666 42.24V196.266667a21.333333 21.333333 0 1 0 42.666666 0v-68.266667a21.333333 21.333333 0 0 0-21.333333-21.333333zM896 874.666667h-68.266667a21.333333 21.333333 0 1 0 0 42.666666h68.266667a21.333333 21.333333 0 1 0 0-42.666666zM896 721.066667a21.333333 21.333333 0 0 0-21.333333 21.333333v68.266667a21.333333 21.333333 0 1 0 42.666666 0v-68.266667a21.333333 21.333333 0 0 0-21.333333-21.333333zM896 567.466667a21.333333 21.333333 0 0 0-21.333333 21.333333v68.266667a21.333333 21.333333 0 1 0 42.666666 0v-68.266667a21.333333 21.333333 0 0 0-21.333333-21.333333z"></path>
        <path d="M221.866667 106.666667H119.466667a21.333333 21.333333 0 0 0-21.333334 21.333333v768a21.333333 21.333333 0 0 0 21.333334 21.333333h162.133333a21.333333 21.333333 0 1 0 0-42.666666h-38.4V128a21.333333 21.333333 0 0 0-21.333333-21.333333z"></path>
    </svg>,
    Border: <svg viewBox="0 0 1024 1024"><path d="M874.666667 934.4h-725.333334a42.666667 42.666667 0 0 1-42.666666-42.666667v-742.4a42.666667 42.666667 0 0 1 42.666666-42.666666h725.333334a42.666667 42.666667 0 0 1 42.666666 42.666666v742.4a42.666667 42.666667 0 0 1-42.666666 42.666667z m-682.666667-85.333333h640v-657.066667h-640v657.066667z"></path></svg>,
    BorderRight: <svg viewBox="0 0 1024 1024">
        <path d="M354.1248 896a21.333333 21.333333 0 0 0 21.333333 21.333333h68.266667a21.333333 21.333333 0 1 0 0-42.666666h-68.266667a21.333333 21.333333 0 0 0-21.333333 21.333333zM273.058133 149.333333h68.266667a21.333333 21.333333 0 1 0 0-42.666666h-68.266667a21.333333 21.333333 0 1 0 0 42.666666zM507.7248 896a21.333333 21.333333 0 0 0 21.333333 21.333333h68.266667a21.333333 21.333333 0 1 0 0-42.666666h-68.266667a21.333333 21.333333 0 0 0-21.333333 21.333333zM750.9248 874.666667h-68.266667a21.333333 21.333333 0 1 0 0 42.666666h68.266667a21.333333 21.333333 0 1 0 0-42.666666zM580.258133 149.333333h68.266667a21.333333 21.333333 0 1 0 0-42.666666h-68.266667a21.333333 21.333333 0 1 0 0 42.666666zM200.5248 896a21.333333 21.333333 0 0 0 21.333333 21.333333h68.266667a21.333333 21.333333 0 1 0 0-42.666666h-68.266667a21.333333 21.333333 0 0 0-21.333333 21.333333zM426.658133 149.333333h68.266667a21.333333 21.333333 0 1 0 0-42.666666h-68.266667a21.333333 21.333333 0 1 0 0 42.666666zM119.458133 610.133333a21.333333 21.333333 0 0 0 21.333334-21.333333v-68.266667a21.333333 21.333333 0 1 0-42.666667 0v68.266667a21.333333 21.333333 0 0 0 21.333333 21.333333zM119.458133 763.733333a21.333333 21.333333 0 0 0 21.333334-21.333333v-68.266667a21.333333 21.333333 0 1 0-42.666667 0v68.266667a21.333333 21.333333 0 0 0 21.333333 21.333333zM119.458133 917.333333h17.066667a21.333333 21.333333 0 0 0 4.266667-42.24V827.733333a21.333333 21.333333 0 1 0-42.666667 0v68.266667a21.333333 21.333333 0 0 0 21.333333 21.333333zM119.458133 149.333333h68.266667a21.333333 21.333333 0 1 0 0-42.666666h-68.266667a21.333333 21.333333 0 1 0 0 42.666666zM119.458133 302.933333a21.333333 21.333333 0 0 0 21.333334-21.333333v-68.266667a21.333333 21.333333 0 1 0-42.666667 0v68.266667a21.333333 21.333333 0 0 0 21.333333 21.333333zM119.458133 456.533333a21.333333 21.333333 0 0 0 21.333334-21.333333v-68.266667a21.333333 21.333333 0 1 0-42.666667 0v68.266667a21.333333 21.333333 0 0 0 21.333333 21.333333z"></path>
        <path d="M793.591467 917.333333h102.4a21.333333 21.333333 0 0 0 21.333333-21.333333V128a21.333333 21.333333 0 0 0-21.333333-21.333333h-162.133334a21.333333 21.333333 0 1 0 0 42.666666h38.4V896a21.333333 21.333333 0 0 0 21.333334 21.333333z"></path>
    </svg>,
    BorderBottom: <svg viewBox="0 0 1024 1024">
        <path d="M123.741867 358.4a21.333333 21.333333 0 0 0-21.333334 21.333333v68.266667a21.333333 21.333333 0 1 0 42.666667 0v-68.266667a21.333333 21.333333 0 0 0-21.333333-21.333333zM870.417067 277.333333v68.266667a21.333333 21.333333 0 1 0 42.666666 0v-68.266667a21.333333 21.333333 0 1 0-42.666666 0zM123.741867 512a21.333333 21.333333 0 0 0-21.333334 21.333333v68.266667a21.333333 21.333333 0 1 0 42.666667 0v-68.266667a21.333333 21.333333 0 0 0-21.333333-21.333333zM145.0752 755.2v-68.266667a21.333333 21.333333 0 1 0-42.666667 0v68.266667a21.333333 21.333333 0 1 0 42.666667 0zM870.417067 584.533333v68.266667a21.333333 21.333333 0 1 0 42.666666 0v-68.266667a21.333333 21.333333 0 1 0-42.666666 0zM123.741867 204.8a21.333333 21.333333 0 0 0-21.333334 21.333333v68.266667a21.333333 21.333333 0 1 0 42.666667 0v-68.266667a21.333333 21.333333 0 0 0-21.333333-21.333333zM870.417067 430.933333v68.266667a21.333333 21.333333 0 1 0 42.666666 0v-68.266667a21.333333 21.333333 0 1 0-42.666666 0zM409.608533 123.733333a21.333333 21.333333 0 0 0 21.333334 21.333334h68.266666a21.333333 21.333333 0 1 0 0-42.666667h-68.266666a21.333333 21.333333 0 0 0-21.333334 21.333333zM256.008533 123.733333a21.333333 21.333333 0 0 0 21.333334 21.333334h68.266666a21.333333 21.333333 0 1 0 0-42.666667h-68.266666a21.333333 21.333333 0 0 0-21.333334 21.333333zM102.408533 123.733333v17.066667a21.333333 21.333333 0 0 0 42.24 4.266667h47.36a21.333333 21.333333 0 1 0 0-42.666667h-68.266666a21.333333 21.333333 0 0 0-21.333334 21.333333zM870.417067 123.733333v68.266667a21.333333 21.333333 0 1 0 42.666666 0v-68.266667a21.333333 21.333333 0 1 0-42.666666 0zM716.817067 123.733333a21.333333 21.333333 0 0 0 21.333333 21.333334h68.266667a21.333333 21.333333 0 1 0 0-42.666667h-68.266667a21.333333 21.333333 0 0 0-21.333333 21.333333zM563.217067 123.733333a21.333333 21.333333 0 0 0 21.333333 21.333334h68.266667a21.333333 21.333333 0 1 0 0-42.666667h-68.266667a21.333333 21.333333 0 0 0-21.333333 21.333333z"></path>
        <path d="M102.408533 797.866667v102.4a21.333333 21.333333 0 0 0 21.333334 21.333333h768a21.333333 21.333333 0 0 0 21.333333-21.333333v-8.533334l0.008533-85.333333v-68.266667a21.333333 21.333333 0 1 0-42.666666 0V776.533333h-746.666667a21.333333 21.333333 0 0 0-21.341867 21.333334z"></path>
    </svg>,
};

interface IBoxShadow {
    inset?: string
    offsetX?: string
    offsetY?: string
    blurRadius?: string
    spreadRadius?: string
    color?: string
}

export const BorderView = defineComponent({
    props: {
        value: {
            type: Object as PropType<CSSProperties>,
        },
        onStyleChange: Function as PropType<(style: CSSProperties) => void>,
    },
    setup(props, { emit }) {
        const [currentValue] = useModel(props, emit, {
            prop: 'value',
            defaultValue: {},
        });

        const provideState = inject(styleKey);

        const onStyleChange = (changedStyle: CSSProperties) => {
            props.onStyleChange?.(changedStyle);
        };

        const selectedBorder: Ref<EnumBorderType> = ref(EnumBorderType.All);

        const borderStyleRef = computed(() => {
            const value = currentValue.value as CSSProperties;
            return {
                style: value[`border${selectedBorder.value}Style`],
                width: value[`border${selectedBorder.value}Width`],
                color: value[`border${selectedBorder.value}Color`],
            };
        });

        const onBorderStyleChange = (type: 'Width' | 'Style' | 'Color', value: string) => {
            onStyleChange({
                [`border${selectedBorder.value}${type}`]: value,
            });
        };

        const onBorderRadiusChange = (type: RadiusType, value: string) => {
            onStyleChange({
                [`border${type}Radius`]: value,
            });
            radiusList.forEach((item) => {
                if (!currentValue.value[`border${item}Radius`]) {
                    onStyleChange({
                        [`border${item}Radius`]: value,
                    });
                }
            });
        };

        const boxShadowStyleRef: Ref<IBoxShadow> = ref({});

        watch(boxShadowStyleRef, () => {
            const arr = [];
            if (boxShadowStyleRef.value.inset)
                arr.push(boxShadowStyleRef.value.inset);

            if (boxShadowStyleRef.value.offsetX)
                arr.push(boxShadowStyleRef.value.offsetX);

            if (boxShadowStyleRef.value.offsetY)
                arr.push(boxShadowStyleRef.value.offsetY);

            if (boxShadowStyleRef.value.blurRadius)
                arr.push(boxShadowStyleRef.value.blurRadius);

            if (boxShadowStyleRef.value.spreadRadius)
                arr.push(boxShadowStyleRef.value.spreadRadius);

            if (boxShadowStyleRef.value.color)
                arr.push(boxShadowStyleRef.value.color);

            if (arr?.length) {
                onStyleChange({
                    boxShadow: arr.join(' '),
                });
            }
        }, {
            deep: true,
        });

        const getBoxShadowFromValue = () => {
            const res: IBoxShadow = {};
            const value = currentValue.value as CSSProperties;
            if (!value.boxShadow)
                return res;

            // TODO: 处理多个
            const boxShadow = value.boxShadow.split(',')[0];
            const values = boxShadow.split(' ');

            if (values[0] === 'inset')
                res.inset = 'inset';

            const indexOffset = res.inset ? 0 : 1;
            res.offsetX = values[1 - indexOffset];
            res.offsetY = values[2 - indexOffset];
            res.blurRadius = values[3 - indexOffset];
            res.spreadRadius = values[4 - indexOffset];
            res.color = values[5 - indexOffset];

            return res;
        };

        onMounted(() => {
            boxShadowStyleRef.value = getBoxShadowFromValue();
        });

        return () => {
            return (
                <FCollapseItem name="border" title="边框">
                    <Row label="边框">
                        <div class="letgo-setter-style__border">
                            <div class="letgo-setter-style__border-icons">
                                <span
                                    class={['letgo-setter-style__border-icon', selectedBorder.value === EnumBorderType.Top && 'letgo-setter-style__border-icon--selected']}
                                    style={{ gridColumnStart: 2, gridColumnEnd: 4 }}
                                >
                                    {svgList.BorderTop}
                                </span>
                                <span
                                    class={['letgo-setter-style__border-icon', selectedBorder.value === EnumBorderType.Left && 'letgo-setter-style__border-icon--selected']}
                                >
                                    {svgList.BorderLeft}
                                </span>
                                <span
                                    class={['letgo-setter-style__border-icon', selectedBorder.value === EnumBorderType.All && 'letgo-setter-style__border-icon--selected']}
                                >
                                    {svgList.Border}
                                </span>
                                <span
                                    class={['letgo-setter-style__border-icon', selectedBorder.value === EnumBorderType.Right && 'letgo-setter-style__border-icon--selected']}
                                >
                                    {svgList.BorderRight}
                                </span>
                                <span
                                    class={['letgo-setter-style__border-icon', selectedBorder.value === EnumBorderType.Bottom && 'letgo-setter-style__border-icon--selected']}
                                    style={{ gridColumnStart: 2, gridColumnEnd: 4 }}
                                >
                                    {svgList.BorderBottom}
                                </span>
                            </div>
                            <div class="letgo-setter-style__border-custom">
                                <Row label="类型" labelWidth={30} labelAlign="right">
                                    <FSelect
                                        modelValue={borderStyleRef.value.style}
                                        onChange={val => onBorderStyleChange('Style', val)}
                                        clearable
                                        options={borderStyleList}
                                    />
                                </Row>
                                <Row label="粗细" labelWidth={30} labelAlign="right">
                                    <InputUnit
                                        modelValue={`${borderStyleRef.value.width ?? ''}`}
                                        onChange={val => onBorderStyleChange('Width', val)}
                                        units={['px']}
                                    />
                                </Row>
                                <Row label="颜色" labelWidth={30} labelAlign="right" margin={false}>
                                    <InputColor
                                        modelValue={borderStyleRef.value.color}
                                        onChange={val => onBorderStyleChange('Color', val)}
                                    />
                                </Row>
                            </div>
                        </div>
                    </Row>
                    <Row label="圆角">
                        <div class="letgo-setter-style__border-radius">
                            {
                                radiusList.map((type) => {
                                    return (
                                        <div class="letgo-setter-style__border-radius-item">
                                            <span class="letgo-setter-style__border-icon">
                                                {svgList[type]}
                                            </span>
                                            <InputUnit
                                                modelValue={currentValue.value[`border${type}Radius`]}
                                                onChange={val => onBorderRadiusChange(type, val)}
                                                units={['px']}
                                            />
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </Row>
                    <Row label="阴影">
                        <FGrid gutter={[12, 12]} wrap>
                            <FGridItem span={24}>
                                <Row label="方向" labelWidth={40} labelAlign="right" margin={false}>
                                    <FRadioGroup
                                        v-model={boxShadowStyleRef.value.inset}
                                    >
                                        <FRadioButton value={undefined}>外阴影</FRadioButton>
                                        <FRadioButton value="inset">内阴影</FRadioButton>
                                    </FRadioGroup>
                                </Row>
                            </FGridItem>
                            <FGridItem span={24}>
                                <Row label="颜色" labelWidth={40} labelAlign="right" margin={false}>
                                    <InputColor
                                        v-model={boxShadowStyleRef.value.color}
                                    />
                                </Row>
                            </FGridItem>
                            <FGridItem span={12}>
                                <Row label="x偏移" labelWidth={40} labelAlign="right" margin={false}>
                                    <InputUnit
                                        v-model={boxShadowStyleRef.value.offsetX}
                                        units={['px']}
                                    />
                                </Row>
                            </FGridItem>
                            <FGridItem span={12}>
                                <Row label="y偏移" labelWidth={40} labelAlign="right" margin={false}>
                                    <InputUnit
                                        v-model={boxShadowStyleRef.value.offsetY}
                                        units={['px']}
                                    />
                                </Row>
                            </FGridItem>
                            <FGridItem span={12}>
                                <Row label="模糊" labelWidth={40} labelAlign="right" margin={false}>
                                    <InputUnit
                                        v-model={boxShadowStyleRef.value.blurRadius}
                                        units={['px']}
                                    />
                                </Row>
                            </FGridItem>
                            <FGridItem span={12}>
                                <Row label="扩展" labelWidth={40} labelAlign="right" margin={false}>
                                    <InputUnit
                                        v-model={boxShadowStyleRef.value.spreadRadius}
                                        units={['px']}
                                    />
                                </Row>
                            </FGridItem>
                        </FGrid>
                    </Row>
                </FCollapseItem>
            );
        };
    },
});
