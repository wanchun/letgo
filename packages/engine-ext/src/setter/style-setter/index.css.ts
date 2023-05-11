import { globalStyle, style } from '@vanilla-extract/css';

export const wrapperCls = style({

});

globalStyle(`${wrapperCls} .fes-radio-group`, {
    width: '100%',
});

globalStyle(`${wrapperCls} .fes-radio-button`, {
    flex: 1,
});

export const lightCls = style({
    color: 'rgba(0, 0, 0, 0.5)',
});
