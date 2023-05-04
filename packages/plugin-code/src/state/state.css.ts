import { style } from '@vanilla-extract/css';

export const categoryCls = style({
    borderTop: '1px solid #ebebeb',
    selectors: {
        '&:first-child': {
            borderTop: 'none',
        },
    },
});

export const categoryTitleCls = style({
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#222',
    fontWeight: '600',
    cursor: 'pointer',
});

export const titleIconCls = style({
    display: 'inline-block',
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    color: '#b3b3b3',
    textAlign: 'center',
    transform: 'rotate(-180deg)',
    transition: 'all 0.3s',
    selectors: {
        [`${categoryTitleCls}:hover &`]: {
            color: '#222',
            backgroundColor: '#f5f5f5',
        },
    },
});

export const activeIconCls = style({
    transform: 'rotate(0)',
});

export const stateWrapCls = style({
    padding: '8px',
});
