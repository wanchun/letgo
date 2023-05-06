import { style } from '@vanilla-extract/css';

export const codeHeaderCls = style({
    display: 'flex',
    height: '24px',
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

export const codeCls = style({
    padding: '4px 12px',
});

export const codeItemCls = style({
    'display': 'flex',
    'alignItems': 'center',
    'height': '28px',
    'padding': '4px 8px',
    'marginBottom': '2px',
    'color': '#222',
    'cursor': 'pointer',

    'borderRadius': '4px',
    ':hover': {
        backgroundColor: '#f0f0f0',
    },
});

export const codeItemActiveCls = style({
    'backgroundColor': '#e6f7ff',
    ':hover': {
        backgroundColor: '#e6f7ff',
    },
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
    fontSize: '12px',
    width: '15px',
    height: '15px',
    borderRadius: '4px',
    backgroundColor: '#ffcc66',
});
