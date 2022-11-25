import { style, globalStyle } from '@vanilla-extract/css';

export const borderCls = style({
    boxSizing: 'border-box',
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    border: `1px solid rgba(25, 122, 255, 1)`,
    willChange: 'transform, width, height',
    overflow: 'visible',
});

export const borderTitleCls = style({
    color: 'rgba(25, 122, 255, 1)',
    transform: 'translateY(-100%)',
    fontWeight: 'lighter',
});

export const borderStatusCls = style({
    marginLeft: '5px',
    color: '#3c3c3c',
    transform: 'translateY(-100%)',
    fontWeight: 'lighter',
});

export const borderActionsCls = style({
    position: 'absolute',
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    pointerEvents: 'all',
});

globalStyle(`${borderActionsCls} > *`, {
    flexShrink: 0,
});

export const borderActionCls = style({
    cursor: 'pointer',
    height: '20px',
    width: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 108, 255, 1)',
    opacity: 1,
    maxHeight: '100%',
    overflow: 'hidden',
    color: '#ffffff',
    ':hover': {
        background: 'rgba(25, 122, 255, 1)',
    },
});

export const borderDetectingCls = style({
    zIndex: '1',
    borderStyle: 'dashed',
    background: 'rgba(0,121,242, .04)',
});

export const borderSelectingCls = style({
    zIndex: '2',
    borderWidth: '2px',
    selectors: {
        '&.is-dragging': {
            background: 'rgba(182, 178, 178, 0.8)',
            border: 'none',
        },
    },
});
