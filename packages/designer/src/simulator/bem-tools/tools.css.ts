import { style } from '@vanilla-extract/css';

export const toolsCls = style({
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    overflow: 'visible',
    zIndex: 800,
});
