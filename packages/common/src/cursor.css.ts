import { globalStyle } from '@vanilla-extract/css';

globalStyle('html.letgo-cursor-dragging, html.letgo-cursor-dragging *', {
  cursor: 'move !important'
})

globalStyle('html.letgo-cursor-x-resizing, html.letgo-cursor-x-resizing *', {
  cursor: 'col-resize'
})

globalStyle('html.letgo-cursor-y-resizing, html.letgo-cursor-y-resizing *', {
  cursor: 'row-resize'
})

globalStyle('html.letgo-cursor-copy, html.letgo-cursor-copy *', {
  cursor: 'copy !important'
})

