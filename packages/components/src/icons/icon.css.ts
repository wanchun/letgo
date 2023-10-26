import { style } from '@vanilla-extract/css';

export const svgCls = style({
    display: 'inline-block',
    width: '1em',
    height: '1em',
    fill: 'currentColor',
});

export const logicIconCls = style({
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
    fontSize: '12px',
    width: '15px',
    height: '15px',
    borderRadius: '4px',
    backgroundColor: '#ffcc66',
});
