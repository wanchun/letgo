import { style } from '@vanilla-extract/css';

export const ghostGroupCls = style({
    boxSizing: 'border-box',
    position: 'fixed',
    zIndex: 99999,
    width: '100px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pointerEvents: 'none',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    boxShadow: '0 0 6px grey',
    transform: 'translate(-10%, -50%)',
});

export const ghostTitleCls = style({
    textAlign: 'center',
    fontSize: '14px',
    textOverflow: 'ellipsis',
    color: 'rgba(0, 0, 0, 0.5)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
});
