import { style } from '@vanilla-extract/css';

export const iconCls = style({
    cursor: 'pointer',
    fontSize: '16px',
    display: 'inline-block',
    color: 'inherit',
    lineHeight: 0,
});

export const svgCls = style({
    display: 'inline-block',
    width: '1em',
    height: '1em',
    fill: 'currentColor',
});
