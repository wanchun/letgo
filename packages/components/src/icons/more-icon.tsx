import { defineComponent } from 'vue';
import { svgCls } from './icon.css';

export default defineComponent({
    setup() {
        return () => {
            return <span ><svg class={svgCls} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="105777" width="32" height="32"><path d="M288 512m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" p-id="105778"></path><path d="M512 512m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" p-id="105779"></path><path d="M736 512m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" p-id="105780"></path></svg></span>;
        };
    },
});
