import { globalStyle, style } from '@vanilla-extract/css';

export const panelCls = style({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
});

export const editWrapper = style({
    display: 'flex',
    height: '100%',
});

export const leftPanelCls = style({
    width: '240px',
    height: '100%',
    borderRight: '1px solid #f1f1f2',
});

export const rightPanelCls = style({
    flex: 1,
});

export const tabsCls = style({
    flex: 1,
    overflow: 'hidden',
});

// 为了滚动
globalStyle(`${panelCls} .fes-tabs-tab-pane`, {
    height: '100%',
});
