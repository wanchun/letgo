import { globalStyle, style } from '@vanilla-extract/css';

export const wrapCls = style({
    display: 'block',
    position: 'relative',
    width: '100%',
});

globalStyle(`${wrapCls} .cm-editor`, {
    border: '1px solid #cfd0d3',
    borderRadius: '4px',
    height: '100px',
});

globalStyle(`${wrapCls} .cm-editor.cm-focused`, {
    border: '1px solid #5384ff',
    outline: 'none',
    boxShadow: '0 0 0 2px #dde6ff',
});
