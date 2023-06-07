import { style } from '@vanilla-extract/css';

export const categoryCls = style({
    'paddingBottom': '12px',
    'borderBottom': '1px solid #ebebeb',
    'marginBottom': '8px',
    ':last-child': {
        border: 0,
    },
});

export const titleCls = style({
    fontSize: '12px',
    padding: 0,
    margin: 0,
    color: '#222',
});
