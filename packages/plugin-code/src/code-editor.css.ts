import { globalStyle, style } from '@vanilla-extract/css';

export const editorCls = style({
});

globalStyle(`${editorCls} > .cm-editor`, {
    borderRadius: '4px',
    minHeight: '85px',
    border: '1px solid #ebebeb',
});

globalStyle(`${editorCls} > .cm-focused`, {
    outline: '1px solid #4096ff',
});

globalStyle(`${editorCls} .cm-gutters`, {
    minHeight: '85px !important',
    borderRight: 0,
});
