import { style } from '@vanilla-extract/css';

export const categoryCls = style({
    borderTop: '1px solid #ebebeb',
    paddingTop: '4px',
    marginBottom: '12px',
    selectors: {
        '&:first-child': {
            borderTop: 'none',
        },
    },
});

export const activeIconCls = style({
    transform: 'rotate(0)',
});

export const stateWrapCls = style({
    padding: '8px',
});
