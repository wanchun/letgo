import { style } from '@vanilla-extract/css';

export const wrapperCls = style({
    minWidth: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    width: '100%',
});

export const contentCls = style({
    flex: 1,
});

export const actionsCls = style({
    marginLeft: '8px',
});

export const iconCls = style({
    cursor: 'pointer',
});
