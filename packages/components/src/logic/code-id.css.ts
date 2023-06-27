import { style } from '@vanilla-extract/css';
import { codeItemActiveCls } from './code.css';

export const codeIdCls = style({
    margin: '0 6px',
    flex: 1,
});

export const idContentCls = style({
    display: 'inline-flex',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
});

export const editIconCls = style({
    display: 'none',
    fontSize: '14px',
    color: '#8c8c8c',
    selectors: {
        [`${codeItemActiveCls} ${idContentCls}:hover &`]: {
            display: 'inline-block',
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
