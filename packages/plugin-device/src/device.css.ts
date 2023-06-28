import { style } from '@vanilla-extract/css';

export const wrapperCls = style({
    display: 'flex',
    gap: '12px',
});

export const iconCls = style({
    display: 'inline-block',
    color: '#333',
    fontSize: '20px',
    cursor: 'pointer',
    lineHeight: 0,
});

export const isActiveCls = style([{
    color: '#5384ff',
}]);
