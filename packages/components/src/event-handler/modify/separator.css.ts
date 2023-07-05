import { style } from '@vanilla-extract/css';

export const separatorCls = style({
    'display': 'flex',
    'alignItems': 'center',
    ':before': {
        borderBottom: '1px solid #d9d9d9',
        content: '',
        flex: '1 0 0',
        marginRight: '4px',
    },
    ':after': {
        borderBottom: '1px solid #d9d9d9',
        content: '',
        flex: '1 0 0',
        marginLeft: '4px',
    },
});
