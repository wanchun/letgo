import { style, globalStyle } from '@vanilla-extract/css';

export const mainCls = style({
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
    fontSize: '14px',
});

export const navigatorCls = style({
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    borderBottom: '1px solid var(--color-line-normal)',
});

export const navigatorItemCls = style({
    margin: '0 4px',
    selectors: {
        '&.is-parent': {
            cursor: 'pointer',
        },
    },
});

export const noticeCls = style({
    textAlign: 'center',
    padding: '50px 15px 0',
});

export const bodyCls = style({
    position: 'absolute',
    top: '30px',
    right: 0,
    left: 0,
    bottom: 0,
    overflowY: 'auto',
});

globalStyle(`${bodyCls} .fes-tabs-nav-wrapper,.fes-tabs-nav-scroll`, {
    width: '100%',
});

globalStyle(`${bodyCls} .fes-tabs-tab`, {
    flex: 1,
});

globalStyle(`${bodyCls} .fes-tabs-tab-label`, {
    display: 'block',
    textAlign: 'center',
});
