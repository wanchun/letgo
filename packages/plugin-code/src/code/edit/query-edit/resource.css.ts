import { style } from '@vanilla-extract/css';

export const wrapCls = style({
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #cfd0d3',
});

export const contentCls = style({
    display: 'flex',
    width: '100%',
    gap: '0 10px',
});
