import type { CSSProperties } from '@vanilla-extract/css';
import { style } from '@vanilla-extract/css';

export const blockFieldCls = style({
    display: 'block',
    position: 'relative',
});

export const accordionFieldCls = style({
    display: 'block',
    position: 'relative',
    margin: '12px',
    selectors: {
        [`${blockFieldCls} &`]: {
            margin: '0',
        },
    },
});

export const plainFieldCls = style({});

export const inlineFieldCls = style({
    display: 'flex',
    alignItems: 'center',
    margin: '12px',
    selectors: {
        [`${accordionFieldCls} &`]: {
            margin: '12px 0',
        },
        [`${accordionFieldCls} &:first-child`]: {
            margin: '0 0 12px',
        },
        [`${accordionFieldCls} &:last-child`]: {
            margin: '12px 0 0',
        },
        [`${blockFieldCls} &`]: {
            margin: '12px 0',
        },
        [`${blockFieldCls} &:first-child`]: {
            margin: '0 0 12px',
        },
        [`${blockFieldCls} &:last-child`]: {
            margin: '12px 0 0',
        },
    },
});

export const popupFieldCls = style([inlineFieldCls]);

export const popupContentCls = style({
    position: 'relative',
    right: '400px',
});

const longHeader: CSSProperties = {
    height: '32px',
    fontWeight: 500,
    background: 'rgba(31,56,88,.06)',
    borderTop: '1px solid rgba(31,56,88, .1)',
    borderBottom: '1px solid rgba(31,56,88, .1)',
    color: 'rgba(0, 0, 0, 0.8)',
    padding: '0 12px',
    userSelect: 'none',
};

export const headerCls = style({
    display: 'flex',
    alignItems: 'center',
    selectors: {
        [`${accordionFieldCls} > &`]: {
            height: '48px',
            fontWeight: 500,
            color: '#0f1222',
            cursor: 'pointer',
        },
        [`${blockFieldCls} > &`]: longHeader,
        [`${inlineFieldCls} > &`]: {
            display: 'inline-flex',
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '70px',
            marginRight: '8px',
            wordBreak: 'break-all',
            whiteSpace: 'normal',
            height: '32px',
        },
    },
});

export const bodyCls = style({
    selectors: {
        [`${blockFieldCls} > &`]: {
            padding: '12px',
        },
        [`${inlineFieldCls} > &`]: {
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
        },
    },
});

export const iconCls = style({
    marginRight: '12px',
});

export const iconShowCls = style({
    transform: 'rotate(90deg)',
});
