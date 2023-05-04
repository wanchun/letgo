import { style } from '@vanilla-extract/css';

export const categoryTitleCls = style({
    padding: '0 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--color-title)',
    marginTop: '20px',
});

export const categoryBodyCls = style({
    padding: '20px',
});

export const categoryItemCls = style({
    width: '100%',
    justifyContent: 'flex-start',
    padding: '0 8px',
});

export const categoryItemIconCls = style({
    height: '100%',
    width: 'auto',
    marginRight: '4px',
});
