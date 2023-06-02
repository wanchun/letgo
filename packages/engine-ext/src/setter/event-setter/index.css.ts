import { style } from '@vanilla-extract/css';

export const pointerCls = style({
    cursor: 'pointer',
});

export const plusIconCls = style({
    fontSize: '14px',
    cursor: 'pointer',
});

export const lightCls = style({
    color: 'rgba(0, 0, 0, 0.5)',
});

export const headerCls = style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
});

export const selectedEventListCls = style({
    listStyleType: 'none',
    padding: '0 0 8px 0',
    margin: '0 0 8px 0',
    fontSize: '12px',
    borderBottom: '1px solid #ebebeb',
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
