import { globalStyle, style } from '@vanilla-extract/css';

export const backgroundPositionWrapperCls = style({
    display: 'flex',
    alignItems: 'center',
});

export const iconWrapperCls = style({
    display: 'grid',
    gap: '4px',
    gridTemplateColumns: 'repeat(3, 24px)',
    gridTemplateRows: 'repeat(3, 24px)',
});

globalStyle(`${iconWrapperCls} .i-icon`, {
    fontSize: '24px',
    width: '24px',
    height: '24px',
    lineHeight: '24px',
    cursor: 'pointer',
    color: 'rgba(0, 0, 0, 0.6)',
});

export const customPositionWrapperCls = style({
    flex: 1,
    marginLeft: '24px',
});
