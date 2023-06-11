import { globalStyle, style } from '@vanilla-extract/css';

export const editorCls = style({
    width: '100%',
});

globalStyle(`${editorCls} > .cm-editor`, {
    borderRadius: '4px',
    border: '1px solid #ebebeb',
});

globalStyle(`${editorCls} > .cm-focused`, {
    outline: '1px solid #4096ff',
});

globalStyle(`${editorCls} .cm-gutters`, {
    borderRight: 0,
});
