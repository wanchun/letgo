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

export const eventListCls = style({
    borderBottom: '1px solid #ebebeb',
});
