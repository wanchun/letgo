import { style } from '@vanilla-extract/css';

export const iconCls = style({
    cursor: 'pointer',
    fontSize: '20px',
    color: 'inherit',
    lineHeight: 0,
});

export const wrapperCls = style({
    position: 'relative',
    height: '100%',
});

export const codeCls = style({
    height: '100%',
    overflow: 'auto',
});

export const actionCls = style({
    position: 'absolute',
    right: '70px',
    top: '-40px',
    zIndex: 100,
});
