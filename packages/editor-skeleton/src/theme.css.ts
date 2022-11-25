import { createGlobalTheme } from '@vanilla-extract/css';

export const themeVars = createGlobalTheme(':root', {
    color: {
        brand: 'rgba(0, 108, 255, 1)',
        brandLight: 'rgba(25, 122, 255, 1)',
        brandDark: 'rgba(0, 96, 229, 1)',
        text: {
            title: 'rgba(0, 0, 0, 0.8)',
            normal: 'rgba(0, 0, 0, 0.6)',
            dark: 'rgba(0, 0, 0, 0.7)',
            light: 'rgba(0, 0, 0, 0.5)',
        },
        line: {
            normal: 'rgba(31, 56, 88, 0.1)',
            darken: 'rgba(31, 56, 88, 0.2)',
        },
    },
    font: {
        family: `'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Helvetica,
        Arial, sans-serif`,
        size: {
            normal: '14px',
        },
    },
});
