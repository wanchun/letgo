import { style } from '@vanilla-extract/css';

export const titleWrapCls = style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '34px',
    borderBottom: '1px solid #ebebeb',
});

export const iconCls = style({
    fontSize: '14px',
    cursor: 'pointer',
    color: '#999',
});
