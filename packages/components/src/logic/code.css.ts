import { style } from '@vanilla-extract/css';

export const codeCls = style({
});

export const codeHeaderCls = style({
    display: 'flex',
    padding: '10px 12px',
    justifyContent: 'flex-end',
    alignItems: 'center',
});

export const headerIconCls = style({
    'fontSize': '16px',
    'color': '#999',
    'cursor': 'pointer',
    ':hover': {
        color: '#000',
    },
});

export const codeItemCls = style({
    'display': 'flex',
    'alignItems': 'center',
    'padding': '6px 12px',
    'cursor': 'pointer',
    ':hover': {
        backgroundColor: '#f5f8ff',
    },
});

export const codeItemActiveCls = style({
    color: '#5384ff',
    backgroundColor: '#f5f8ff',
});

export const codeWrapCls = style({
    margin: 0,
    padding: 0,
});

export const codeItemIdCls = style({
    margin: '0 6px',
    flex: 1,
});

export const codeCommonIconCls = style({
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
    width: '15px',
    height: '15px',
    borderRadius: '4px',
    backgroundColor: '#ffcc66',
});

export const codeMoreIconCls = style({
    opacity: 0,
    justifyContent: 'center',
    alignItems: 'center',
    color: '#8a8a8a',
    fontSize: '15px',
    width: '22px',
    height: '18px',
    selectors: {
        [`${codeItemCls}:hover &`]: {
            opacity: 1,
        },
        [`${codeItemActiveCls} &`]: {
            opacity: 1,
        },
    },
});
