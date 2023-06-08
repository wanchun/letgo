import { globalStyle, style } from '@vanilla-extract/css';

export const failureConditionCls = style({
    padding: 0,
    margin: 0,
    borderRadius: '4px',
    border: '1px solid #ebebeb',
});

export const failureItemCls = style({
    display: 'flex',
    listStyleType: 'none',
    borderBottom: '1px solid #ebebeb',
});

export const conditionCls = style({
    width: '140px',
    borderRight: '1px solid #ebebeb',
});

globalStyle(`${failureItemCls} .fes-input-inner`, {
    border: 0,
});

export const addBtnCls = style({
    display: 'flex',
    alignItems: 'center',
    height: '32px',
    minWidth: '120px',
    paddingLeft: '12px',
    color: '#5384ff',
    fontSize: '12px',
    listStyleType: 'none',
});

export const actionCls = style({
    width: '24px',
    borderLeft: '1px solid #ebebeb',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
});

export const iconCls = style({
    'color': '#8c8c8c',
    'fontSize': '12px',
    'padding': '0 4px',
    'cursor': 'pointer',
    ':hover': {
        color: '#222',
    },
});
