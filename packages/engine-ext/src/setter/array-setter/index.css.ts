import { style } from '@vanilla-extract/css';

export const wrapperCls = style({
    width: '100%',
});

export const titleWrapperCls = style({
    display: 'flex',
    padding: '0 22px 8px 22px',
    gap: '8px',
});

export const titleCls = style({
    flex: 1,
});

export const bodyWrapperCls = style({
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    padding: '0 0 8px 0',
});

export const bigBodyWrapperCls = style({
    padding: '0 0 24px 0',
});

export const bodyCls = style({
    flex: 1,
});

export const addWrapperCls = style({
    padding: '0px 22px',
});

export const iconCls = style({
    fontSize: '14px',
    lineHeight: 0,
    cursor: 'pointer',
});

export const popupContentCls = style({
    position: 'relative',
    right: '400px',
});

// export const itemCls = style({
//     display: 'flex',
//     alignItems: 'center',
//     padding: '8px 16px',
//     marginBottom: '12px',
//     borderRadius: '4px',
// });

// export const itemContentCls = style({
//     flex: 1,
// });

// export const itemIconCls = style({
//     cursor: 'pointer',
//     margin: '4px 0 4px 16px',
// });
