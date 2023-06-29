import { globalStyle, style } from '@vanilla-extract/css';

export const wrapperCls = style({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
});

export const searchCls = style({
    padding: '8px 16px',
});

export const tabsCls = style({
    flex: 1,
    overflow: 'hidden',
});

// 为了滚动
globalStyle(`${tabsCls} .fes-tabs-tab-pane`, {
    height: '100%',
});

export const categoryCls = style({
    width: '100%',
    overflow: 'hidden',
});

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
