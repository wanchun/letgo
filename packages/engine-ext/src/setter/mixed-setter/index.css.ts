import { style } from '@vanilla-extract/css';

export const wrapperCls = style({
    minWidth: '0',
    marginRight: '26px',
    display: 'block',
    position: 'relative',
    width: '100%',
});

export const actionsCls = style({
    position: 'absolute',
    right: '-4px',
    top: '50%',
    transform: 'translate(100%, -50%)',
    fontSize: '14px',
});

export const iconCls = style({
    cursor: 'pointer',
});
