import { style } from '@vanilla-extract/css';

export const wrapperCls = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

export const labelCls = style({
    width: '60px',
    whiteSpace: 'normal',
    wordBreak: 'break-all',
});

export const contentCls = style({
    flex: 1,
});
