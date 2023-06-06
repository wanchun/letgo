import { style } from '@vanilla-extract/css';

export const eventHandlersCls = style({
    paddingTop: '12px',
    borderTop: '1px solid #ebebeb',
});

export const titleCls = style({
    margin: 0,
    padding: '0 0 8px 0',
    fontSize: '12px',
});

export const eventListTitle = style({
    color: '#8c8c8c',
    fontSize: '12px',
});

export const plusIconCls = style({
    'color': '#8c8c8c',
    'fontSize': '14px',
    'marginLeft': '12px',
    'cursor': 'pointer',
    ':hover': {
        color: '#222',
    },
});
