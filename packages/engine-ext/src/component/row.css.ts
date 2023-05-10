import { style } from '@vanilla-extract/css';

export const wrapperCls = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: '12px',
});

export const labelCls = style({
    width: '60px',
    whiteSpace: 'normal',
    wordBreak: 'break-all',
    marginRight: '8px',
    flexShrink: 0,
    color: 'rgba(0, 0, 0, 0.8)',
});

export const contentCls = style({
    flex: 1,
    minWidth: 0,
});
