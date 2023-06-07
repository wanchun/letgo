import { style } from '@vanilla-extract/css';

export const leftTabsCls = style({
    display: 'flex',

});

export const tabCls = style({
    outline: 'none',
    border: 0,
    color: '#777',
    marginRight: '4px',
    fontWeight: 600,
    height: '24px',
    borderRadius: '24px',
    padding: '2px 12px',
    fontSize: '12px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
});

export const activeTabCls = style({
    color: '#222',
    backgroundColor: '#f6f6f6',
});
