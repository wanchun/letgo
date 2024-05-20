import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import './icon.less';

export default defineComponent({
    setup() {
        return () => {
            return (
                <span class="letgo-comp-icon">
                    <svg class="letgo-comp-icon__svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1483" width="200" height="200"><path d="M526.49 238.592a119.245 119.245 0 1 0-119.501-119.347 119.347 119.347 0 0 0 119.5 119.347zM258.816 709.12a119.296 119.296 0 1 0 11.93 90.675 119.86 119.86 0 0 0-11.93-90.675z m669.594-55.603a119.398 119.398 0 1 0 55.705 72.448 119.5 119.5 0 0 0-55.705-72.448zM703.898 216.525A387.482 387.482 0 0 1 912.64 586.65a36.454 36.454 0 0 0 34.1 38.707h2.406a36.557 36.557 0 0 0 36.454-34.048 460.8 460.8 0 0 0-247.757-439.501 36.454 36.454 0 0 0-49.305 15.36 35.84 35.84 0 0 0 15.36 49.1zM98.868 623.104a16.23 16.23 0 0 0 2.2 0 36.557 36.557 0 0 0 34.356-38.554 387.226 387.226 0 0 1 210.944-368.998 36.454 36.454 0 1 0-33.485-64.82 460.8 460.8 0 0 0-250.419 438.17 36.506 36.506 0 0 0 36.403 34.304z m632.114 267.213a390.707 390.707 0 0 1-415.795-1.127 36.506 36.506 0 1 0-39.27 61.44 463.514 463.514 0 0 0 493.926 1.434 36.506 36.506 0 0 0-38.86-61.85z m0 0" p-id="1484"></path></svg>
                </span>
            );
        };
    },
});
