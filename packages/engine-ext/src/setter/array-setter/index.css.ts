import { style } from '@vanilla-extract/css';

export const wrapperCls = style({
    width: '100%',
});

export const itemCls = style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgb(250, 250, 252)',
    padding: '8px 16px',
    marginBottom: '12px',
    borderRadius: '4px',
});

export const itemContentCls = style({
    flex: 1,
});

export const itemIconCls = style({
    cursor: 'pointer',
    margin: '4px 0 4px 16px',
});
