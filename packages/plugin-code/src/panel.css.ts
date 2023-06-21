import { style } from '@vanilla-extract/css';

export const panelCls = style({
    display: 'flex',
    height: '100%',
});

export const leftPanelCls = style({
    width: '280px',
    flexShrink: 0,
    height: '100%',
    borderRight: '1px solid #ebebeb',
});

export const rightPanelCls = style({
    flex: 1,
    width: 0,
});
