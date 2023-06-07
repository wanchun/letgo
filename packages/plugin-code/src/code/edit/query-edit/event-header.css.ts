import { style } from '@vanilla-extract/css';

export const eventListTitle = style({
    color: '#8c8c8c',
    fontSize: '12px',
});

export const popperWrapCls = style({
    width: '320px',
    padding: '12px',
});

export const popperHeaderCls = style({
    height: '24px',
    textAlign: 'right',
});

export const iconCls = style({
    'color': '#8c8c8c',
    'fontSize': '12px',
    'marginLeft': '8px',
    'cursor': 'pointer',
    ':hover': {
        color: '#222',
    },
});
