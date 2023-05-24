import { style } from '@vanilla-extract/css';

export const labelCls = style({
    fontWeight: 600,
});

export const labelIconCls = style({
    paddingTop: '0',
    fontSize: '12px',
    color: '#bfbfbf',
    transition: 'all 0.3s',
    cursor: 'pointer',
    display: 'inline-block',
    lineHeight: 0,
});

export const iconActiveCls = style({
    transform: 'rotate(90deg)',
});
