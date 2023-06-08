import { style } from '@vanilla-extract/css';

export const iconCls = style({
    cursor: 'pointer',
    fontSize: '20px',
    color: 'inherit',
    lineHeight: 0,
});

export const nodeIconCls = style([iconCls, {
    fontSize: '16px',
}]);

export const suffixWrapperCls = style({
    marginRight: '12px',
});
