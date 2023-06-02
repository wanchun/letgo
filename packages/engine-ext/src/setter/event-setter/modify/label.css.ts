import { style } from '@vanilla-extract/css';

export const labelWrapCls = style({
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
});

export const labelTextCls = style({
    flex: '0 0 120px',
    color: '#555',
    marginRight: '8px',
});
