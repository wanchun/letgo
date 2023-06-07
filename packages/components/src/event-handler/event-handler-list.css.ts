import { style } from '@vanilla-extract/css';

export const selectedEventListCls = style({
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    fontSize: '12px',
});

export const selectedEventCls = style({
    'display': 'flex',
    'alignItems': 'center',
    'justifyContent': 'space-between',
    'height': '28px',
    'padding': '4px 8px',
    'marginBottom': '2px',
    'borderRadius': '2px',
    'cursor': 'pointer',
    ':hover': {
        backgroundColor: '#f0f0f0',
    },
    ':last-child': {
        marginBottom: 0,
    },
});

export const activeEventCls = style({
    'backgroundColor': '#e6f7ff',
    ':hover': {
        backgroundColor: '#e6f7ff',
    },
});

export const deleteIconCls = style({
    fontSize: '12px',
    color: '#bfbfbf',
    cursor: 'pointer',
});

export const callExpressionCls = style({
    color: '#8c8c8c',
});
