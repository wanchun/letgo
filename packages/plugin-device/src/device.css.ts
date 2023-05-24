import { style } from '@vanilla-extract/css';

export const wrapperCls = style({
    display: 'flex',
    gap: '12px',
});

export const iconCls = style({
    color: '#333',
    fontSize: '20px',
    cursor: 'pointer',
});

export const isActiveCls = style([{
    color: '#5384ff',
}]);
