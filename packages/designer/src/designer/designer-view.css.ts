import { style, globalStyle } from '@vanilla-extract/css';

export const designerCls = style({
    position: 'relative',
    boxSizing: 'border-box',
    fontFamily: `'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Helvetica,
    Arial, sans-serif`,
    fontSize: '14px',
});

globalStyle(`${designerCls} *`, {
    boxSizing: 'border-box',
});

export const projectCls = style({
    position: 'relative',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
});

export const projectContentCls = style({
    selectors: {
        [`${projectCls} &`]: {
            width: '100%',
            height: '100%',
        },
    },
});

export const loadingCls = style({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
});
