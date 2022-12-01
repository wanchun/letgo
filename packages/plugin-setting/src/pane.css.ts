import { style } from '@vanilla-extract/css';

export const paneWrapperCls = style({
    position: 'absolute',
    top: '31px',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: '24px',
    overflowY: 'auto',
    overflowX: 'hidden',
});
