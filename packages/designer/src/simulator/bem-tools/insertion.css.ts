import { style } from '@vanilla-extract/css';

export const wrapCls = style({
    position: 'absolute',
    top: '-2px',
    left: 0,
    zIndex: 12,
    pointerEvents: 'none',
    backgroundColor: '#5384ff',
    height: '4px',

});

export const coverCls = style({
    selectors: {
        [`${wrapCls}&`]: {
            top: '0',
            height: 'auto',
            width: 'auto',
            border: 'none',
            opacity: 0.3,
        },
    },
});

export const verticalCls = style({
    selectors: {
        [`${wrapCls}&`]: {
            top: 0,
            left: '-2px',
            width: '4px',
            height: 'auto',
        },
    },
});

export const invalidCls = style({
    selectors: {
        [`${wrapCls}&`]: {
            backgroundColor: 'red',
        },
    },
});
