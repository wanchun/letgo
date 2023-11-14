import { style } from '@vanilla-extract/css';

export const globalCodeCls = style({
    display: 'flex',
    height: 'calc(100vh - 55px)',
});

export const leftPanelCls = style({
    selectors: {
        [`${globalCodeCls} &`]: {
            width: '280px',
            flexShrink: 0,
            height: '100%',
            borderRight: '1px solid #f1f1f2',
        },
    },
});

export const rightPanelCls = style({
    selectors: {
        [`${globalCodeCls} &`]: {
            flex: 1,
            width: 0,
        },
    },
});
