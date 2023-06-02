import { style } from '@vanilla-extract/css';

export const separatorCls = style({
    'display': 'flex',
    'alignItems': 'center',
    ':before': {
        borderBottom: '1px solid #d9d9d9',
        content: '',
        flex: '1 0 0',
        transform: 'translateY(-0.5px)',
        marginRight: '4px',
    },
    ':after': {
        borderBottom: '1px solid #d9d9d9',
        content: '',
        flex: '1 0 0',
        transform: 'translateY(-0.5px)',
        marginLeft: '4px',
    },
});
