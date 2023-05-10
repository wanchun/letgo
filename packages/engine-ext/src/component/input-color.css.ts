import { style } from '@vanilla-extract/css';

export const inputWrapCls = style({
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    border: '1px solid #cfd0d3',
    borderRadius: '4px',
    height: '32px',
    lineHeight: '32px',
    width: '100%',
    padding: '0 8px',
});

export const inputCls = style({
    display: 'block',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
});

export const inputColorBoxCls = style({
    width: '20px',
    height: '20px',
});

export const inputTextCls = style({
    marginLeft: '12px',
    color: 'var(--f-text-color)',
});

export const inputTextNullCls = style([inputTextCls, {
    marginLeft: '-20px',
    color: 'var(--f-text-color-caption)',
}]);
