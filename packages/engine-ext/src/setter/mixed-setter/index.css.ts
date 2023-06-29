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
    // 避免超出宽度
    overflow: 'hidden',
});

export const actionsCls = style({
    display: 'flex',
    alignItems: 'center',
    marginLeft: '8px',
});

export const iconCls = style({
    cursor: 'pointer',
    lineHeight: 0,
});

export const isActive = style({
    color: '#5384ff',
});
