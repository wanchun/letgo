import { style } from '@vanilla-extract/css';

export const contentItemCls = style({
    display: 'flex',
    fontSize: '12px',
    marginTop: '8px',
});

export const labelCls = style({
    width: '100px',
    flexShrink: 0,
    height: '32px',
    lineHeight: '32px',
    color: '#555',
    paddingRight: '12px',
});
