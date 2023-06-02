import { style } from '@vanilla-extract/css';

export const separatorCls = style({
    'display': 'flex',
    ':before': {
        borderBottom: '1px solid #d8ecfd',
        content: '',
        flex: '1 0 0',
        transform: 'translateY(-0.5px)',
    },
    ':after': {
        borderBottom: '1px solid #d8ecfd',
        content: '',
        flex: '1 0 0',
        transform: 'translateY(-0.5px)',
    },
});
