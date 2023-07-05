import { style } from '@vanilla-extract/css';

export const categoryTitleCls = style({
    display: 'flex',
    justifyContent: 'space-between',
    color: '#222',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '12px',
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
