import { style } from '@vanilla-extract/css';

export const wrapCls = style({
});

export const contentCls = style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
});

export const methodCls = style({
    selectors: {
        [`${contentCls} &`]: {
            width: '80px',
            height: '30px',
            minHeight: '30px',
        },
    },
});

export const apiCls = style({
    flex: 1,
    marginLeft: '12px',
    fontSize: '14px',
    lineHeight: 1.6,
    width: 0,
});

export const tipCls = style({
    background: '#f0f0f0',
    borderRadius: '4px',
    padding: '6px 8px',
    fontSize: '12px',
});
