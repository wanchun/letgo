import { style } from '@vanilla-extract/css';
import { headerCommonCls } from './code-edit.css';

export const stateCls = style({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
});

export const headerCls = style([headerCommonCls, {
    justifyContent: 'center',
    alignItems: 'center',
}]);

export const contentCls = style({
    flex: 1,
    padding: '18px',
});

export const inputItemCls = style({
    display: 'flex',
    alignItems: 'center',
});

export const inputLabelCls = style({
    display: 'inline-block',
    width: '80px',
    marginRight: '12px',
});
