import { style } from '@vanilla-extract/css';
import { headerCommonCls } from './code-edit.css';

export const headerCls = style([headerCommonCls, {
    justifyContent: 'end',
    alignItems: 'center',
}]);

export const contentCls = style({
    padding: '18px',
});
