import { globalStyle, style } from '@vanilla-extract/css';

export const backgroundPositionWrapperCls = style({
    display: 'flex',
    alignItems: 'center',
});

export const iconWrapperCls = style({
    display: 'grid',
    gap: '4px',
    gridTemplateColumns: 'repeat(3, 30px)',
    gridTemplateRows: 'repeat(3, 30px)',
});

globalStyle(`${iconWrapperCls} .i-icon`, {
    cursor: 'pointer',
});

export const customPositionWrapperCls = style({
    flex: 1,
    marginLeft: '12px',
});
