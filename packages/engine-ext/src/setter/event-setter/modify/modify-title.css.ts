import { style } from '@vanilla-extract/css';

export const titleWrapCls = style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '34px',
    fontSize: '14px',
});

export const iconCls = style({
    fontSize: '14px',
    cursor: 'pointer',
    color: '#999',
});
