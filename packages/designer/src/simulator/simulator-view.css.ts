import { style } from '@vanilla-extract/css';

export const simulatorCls = style({
    position: 'relative',
    height: '100%',
    width: '100%',
    overflow: 'auto',
});

export const canvasCls = style({
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    overflow: 'hidden',
});

export const deviceMobileCls = style({
    left: '50%',
    width: '375px',
    top: '16px',
    bottom: '16px',
    maxHeight: 'calc(100% - 32px)',
    maxWidth: 'calc(100% - 32px)',
    transform: 'translateX(-50%)',
    boxShadow: '0 2px 10px 0 rgba(31, 56, 88, 0.15)',
});

export const deviceIphoneXCls = style({
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '375px',
    height: '812px',
    maxHeight: 'calc(100vh - 50px)',
    backgroundSize: '375px 812px',
    borderRadius: '44px',
    boxShadow: 'rgba(0, 0, 0, 0.1) 0 36px 42px',
});

export const deviceIphone6Cls = style({
    left: '50%',
    width: '375px',
    transform: 'translateX(-50%)',
    backgroundSize: '375px 772px',
    top: '8px',
});

export const deviceDefaultCls = style({
    top: '16px',
    right: '16px',
    bottom: '16px',
    left: '16px',
    width: 'auto',
    boxShadow: '0 1px 4px 0 rgba(31, 50, 88, 0.125)',
});

export const canvasViewportCls = style({
    selectors: {
        [`${deviceIphoneXCls} &`]: {
            width: 'auto',
            top: '50px',
            left: '0',
            right: '0',
            marginTop: '40px',
            maxHeight: '688px',
        },
        [`${deviceIphone6Cls} &`]: {
            width: 'auto',
            top: '114px',
            left: '25px',
            right: '25px',
            maxHeight: '561px',
            borderRadius: '0 0 2px 2px',
        },
    },
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '100%',
});

export const contentCls = style({
    position: 'absolute',
    top: '0',
    bottom: '0',
    left: '0',
    width: '100%',
    overflow: 'hidden',
});

export const contentIframeCls = style({
    border: 'none',
    transformOrigin: '0 0',
    height: '100%',
    width: '100%',
});
