import { globalStyle, style } from '@vanilla-extract/css';

export const borderWrapperCls = style({
    display: 'flex',
    alignItems: 'center',
});

export const iconWrapperCls = style({
    display: 'grid',
    gap: '4px',
    gridTemplateColumns: 'repeat(3, 24px)',
    gridTemplateRows: 'repeat(3, 24px)',
});

export const iconCls = style({
    fontSize: '24px',
    width: '24px',
    height: '24px',
    lineHeight: '24px',
    cursor: 'pointer',
    color: 'rgba(0, 0, 0, 0.8)',
});

globalStyle(`${iconCls} > svg`, {
    width: '1em',
    height: '1em',
    verticalAlign: 'middle',
    fill: 'currentColor',
});

export const isSelectedCls = style({
    color: '#5384ff',
});

export const customWrapperCls = style({
    flex: 1,
    marginLeft: '24px',
});

export const radiusWrapperCls = style({
    display: 'grid',
    gap: '8px',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridTemplateRows: 'repeat(2, 32px)',
});

export const radiusItemCls = style({
    display: 'flex',
    alignItems: 'center',
    columnGap: '4px',
});
