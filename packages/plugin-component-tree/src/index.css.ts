import { style } from '@vanilla-extract/css';

export const iconCls = style({
    display: 'inline-block',
    cursor: 'pointer',
    fontSize: '20px',
    color: 'inherit',
    lineHeight: 0,
});

export const nodeIconCls = style([iconCls, {
    fontSize: '16px',
}]);

export const wrapperCls = style({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
});

export const searchCls = style({
    padding: '8px 16px',
    borderBottom: '1px solid #f1f1f2',
});

export const treeCls = style({
    flex: 1,
    width: '100%',
    overflow: 'hidden',
});

export const suffixWrapperCls = style({
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});
