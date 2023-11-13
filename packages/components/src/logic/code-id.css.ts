import { style } from '@vanilla-extract/css';
import { codeItemActiveCls } from './code.css';

export const codeIdCls = style({
    margin: '0 6px',
    flex: 1,
    overflow: 'hidden',
});

export const idContentCls = style({
    display: 'inline-flex',
    width: '100%',
    alignItems: 'center',
    height: '26px',
    lineHeight: '26px',
});

export const idContentTextCls = style({
    maxWidth: 'calc(100% - 16px)',
    marginRight: '2px',
});

export const editIconCls = style({
    opacity: 0,
    fontSize: '14px',
    color: '#5384ff',
    display: 'flex',
    alignItems: 'center',
    selectors: {
        [`${codeItemActiveCls} ${idContentCls}:hover &`]: {
            opacity: 1,
        },
    },
});

export const inputCls = style({
    height: '24px',
    border: 0,
    borderRadius: '4px',
    outline: 0,
    backgroundColor: '#fff',
    width: '100%',
});

export const inputErrorCls = style({
    border: '1px solid #f5222d',
});
