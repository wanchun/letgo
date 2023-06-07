import { style } from '@vanilla-extract/css';

export const wrapperCls = style({
    position: 'relative',
    marginRight: '2px',
    color: '#fff',
    borderRadius: '3px',
    pointerEvents: 'auto',
    flexGrow: 0,
    flexShrink: 0,
});

export const triggerCls = style({
    background: 'rgba(0, 108, 255, 1)',
    padding: '0 6px',
    height: '20px',
    lineHeight: '20px',
    cursor: 'pointer',
    color: '#fff',
    borderRadius: '3px',
    fontSize: '12px',
});

export const nodeCls = style({
    'height': '20px',
    'fontSize': '12px',
    ':hover': {
        opacity: 0.8,
    },
    'selectors': {
        '&:not(:first-child)': {
            marginTop: '2px',
        },
    },
});

export const nodeContentCls = style({
    padding: '0px 6px',
    background: '#78869a',
    borderRadius: '3px',
    height: '20px',
    lineHeight: '20px',
    color: '#fff',
    cursor: 'pointer',
    overflow: 'visible',
});
