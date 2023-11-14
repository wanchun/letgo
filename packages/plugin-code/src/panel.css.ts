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
    width: '100%',
});

export const leftPanelCls = style({
    selectors: {
        [`${editWrapper} &`]: {
            width: '240px',
            height: '100%',
            borderRight: '1px solid #f1f1f2',
        },
    },
});

export const rightPanelCls = style({
    selectors: {
        [`${editWrapper} &`]: {
            flex: 1,
            overflow: 'hidden',
        },
    },

});

export const tabsCls = style({
    flex: 1,
    overflow: 'hidden',
});

// 为了滚动
globalStyle(`${panelCls} .fes-tabs-tab-pane`, {
    height: '100%',
});
