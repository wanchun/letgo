import { globalStyle, style } from '@vanilla-extract/css';

export const panelCls = style({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
});

export const tabsCls = style({
    flex: 1,
    overflow: 'hidden',
});

// 为了滚动
globalStyle(`${panelCls} .fes-tabs-tab-pane`, {
    height: '100%',
});
