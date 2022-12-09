import { style, globalStyle } from '@vanilla-extract/css';
import { themeVars } from '../theme.css';

const horizontal = style({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
});

const horizontalLeft = style([horizontal]);

const horizontalCenter = style([
    horizontal,
    {
        flex: 1,
    },
]);

const horizontalRight = style([horizontal]);

globalStyle('html, body', {
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    padding: 0,
    margin: 0,
    position: 'relative',
    fontFamily: themeVars.font.family,
    fontSize: themeVars.font.size.normal,
    color: themeVars.color.text.normal,
    backgroundColor: '#edeff3',
});

export const workbenchCls = style({
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#edeff3',
    position: 'relative',
});

globalStyle(`${workbenchCls} *`, {
    boxSizing: 'border-box',
});

export const topAreaCls = style({
    height: '48px',
    width: '100%',
    marginBottom: '2px',
    padding: '8px 12px 8px 16px',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
});

export const topAreaLeftCls = style([horizontalLeft]);

export const topAreaCenterCls = style([horizontalCenter]);

export const topAreaRightCls = style([horizontalRight]);

export const workbenchBodyCls = style({
    flex: 1,
    position: 'relative',
    display: 'flex',
});

export const leftAreaCls = style({
    height: '100%',
    width: '48px',
    backgroundColor: '#fff',
    flexShrink: '0',
    justifyContent: 'space-between',
    overflow: 'hidden',
});

export const leftAreaTopCls = style({
    display: 'flex',
    paddingTop: '12px',
    flexDirection: 'column',
    alignItems: 'center',
});

export const leftAreaBottomCls = style({
    display: 'flex',
    paddingBottom: '12px',
    flexDirection: 'column',
    alignItems: 'center',
});

export const leftFloatAreaCls = style({
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '49px',
    width: '300px',
    backgroundColor: '#fff',
    boxShadow: '4px 6px 6px 0 rgb(31 50 88 / 8%)',
    zIndex: 820,
    display: 'flex',
    flexDirection: 'column',
});

export const leftFloatAreaHeaderCls = style({
    fontWeight: '500',
    fontSize: '16px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: themeVars.color.text.title,
});

export const headerIconsCls = style({});

export const headerIconCls = style({
    marginRight: '8px',
    ':last-child': {
        marginRight: 0,
    },
});

export const leftFloatAreaBodyCls = style({
    position: 'relative',
    flex: 1,
});

export const fixedAreaCls = style({
    marginLeft: '1px',
    width: '300px',
    backgroundColor: '#fff',
    height: '100%',
    display: 'none',
    flexShrink: 0,
    position: 'relative',
    zIndex: 820,
});

export const workbenchCenterCls = style({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 10,
});

export const toolbarCls = style({
    height: '36px',
    width: '100%',
    padding: '8px 16px',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
});

export const toolbarLeftCls = style([horizontalLeft]);

export const toolbarCenterCls = style([horizontalCenter]);

export const toolbarRightCls = style([horizontalRight]);

export const mainAreaCls = style({
    flex: 1,
});

export const bottomAreaCls = style([
    toolbarCls,
    {
        height: '24px',
    },
]);

export const bottomAreaLeftCls = style([horizontalLeft]);

export const bottomAreaCenterCls = style([horizontalCenter]);

export const bottomAreaRightCls = style([horizontalRight]);

export const rightAreaCls = style({
    height: '100%',
    width: '400px',
    backgroundColor: '#fff',
    flexShrink: 0,
    marginLeft: '2px',
    position: 'relative',
});
