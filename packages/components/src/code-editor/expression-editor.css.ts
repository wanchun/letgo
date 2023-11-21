import { globalStyle, style } from '@vanilla-extract/css';

export const editorCls = style({
    width: '100%',
});

globalStyle(`${editorCls} .cm-editor`, {
    minHeight: '32px',
});

globalStyle(`${editorCls} .cm-editor .cm-scroller`, {
    marginTop: '3px',
    marginLeft: '2px',
});

globalStyle(`${editorCls} .cm-editor .cm-placeholder`, {
    color: '#cfd0d3',
});
