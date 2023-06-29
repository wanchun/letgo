import { globalStyle, style } from '@vanilla-extract/css';

export const wrapCls = style({
    display: 'block',
    position: 'relative',
    width: '100%',
});

globalStyle(`${wrapCls} .cm-editor`, {
    height: '100px',
    outline: 'none',
});

globalStyle(`${wrapCls}.is-bordered .cm-editor`, {
    border: '1px solid #cfd0d3',
    borderRadius: '4px',
});

globalStyle(`${wrapCls}.is-bordered .cm-editor.cm-focused`, {
    border: '1px solid #5384ff',
    boxShadow: '0 0 0 2px #dde6ff',
});

export const fullScreenWrapperCls = style({});

export const fullScreenIconCls = style({
    position: 'absolute',
    bottom: '4px',
    right: '4px',
    cursor: 'pointer',
    zIndex: 1,
});

globalStyle(`${fullScreenWrapperCls} .fes-scrollbar-container`, {
    padding: 0,
});

globalStyle(`${fullScreenWrapperCls} .fes-scrollbar-content`, {
    height: '100%',
});

globalStyle(`${fullScreenWrapperCls} .cm-editor`, {
    borderRadius: 0,
    borderRight: 'none',
    borderLeft: 'none',
    height: '100%',
});
