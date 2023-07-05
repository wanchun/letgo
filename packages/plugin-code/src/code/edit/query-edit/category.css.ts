import { style } from '@vanilla-extract/css';

export const categoryCls = style({
    'paddingBottom': '12px',
    'borderBottom': '1px solid #cfd0d3',
    'marginBottom': '8px',
    ':last-child': {
        border: 0,
    },
});

export const titleCls = style({
    padding: 0,
    margin: 0,
    color: '#222',
});
