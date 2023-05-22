import { style } from '@vanilla-extract/css';

export const wrapCls = style({
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    border: '1px solid #cfd0d3',
    borderRadius: '4px',
    height: '32px',
    lineHeight: '32px',
    width: '100%',
    padding: '0 8px',
    selectors: {
        '&:hover': {
            borderColor: '#5384ff',
            boxShadow: '0 0 0 2px #dde6ff',
        },
    },
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

export const iconBoxCls = style({
    width: '20px',
    height: '20px',
});

export const textCls = style({
    flex: 1,
    marginLeft: '12px',
    color: 'var(--f-text-color)',
});

export const textNullCls = style([textCls, {
    marginLeft: '-20px',
    color: 'var(--f-text-color-caption)',
}]);

export const iconCls = style({
    position: 'relative',
    zIndex: 2,
    color: '#cfd0d3',
    cursor: 'pointer',
});

export const iconsCls = style({
    width: '200px',
});
