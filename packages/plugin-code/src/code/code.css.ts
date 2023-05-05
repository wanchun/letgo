import { style } from '@vanilla-extract/css';

export const codeHeaderCls = style({
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
});

export const headerIconCls = style({
    'fontSize': '16px',
    'color': '#999',
    ':hover': {
        color: '#222',
    },
});
