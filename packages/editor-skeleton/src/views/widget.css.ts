import { style } from '@vanilla-extract/css';

export const widgetCls = style({});

export const disabledCls = style({
    pointerEvents: 'none',
    opacity: 0.4,
});

export const activeCls = style({
    color: '#5384ff',
});
