import { style } from '@vanilla-extract/css';

export const eventListTitle = style({
    display: 'flex',
    alignItems: 'center',
    color: '#555',
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
    'fontSize': '12px',
    'marginLeft': '8px',
    'cursor': 'pointer',
    ':hover': {
        color: '#222',
    },
});
