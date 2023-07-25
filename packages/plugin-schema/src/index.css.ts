import { style } from '@vanilla-extract/css';

export const iconCls = style({
    cursor: 'pointer',
    fontSize: '20px',
    color: 'inherit',
    lineHeight: 0,
});

export const wrapperCls = style({
    height: '100%',
});

export const codeCls = style({
    height: 'calc(100% - 36px)',
    overflow: 'auto',
});

export const actionCls = style({
    padding: '6px 0',
    textAlign: 'right',
});
