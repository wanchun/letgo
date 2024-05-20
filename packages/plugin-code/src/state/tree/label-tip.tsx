import { isArray } from 'lodash-es';
import { computed, defineComponent } from 'vue';

export default defineComponent({
    props: {
        value: [Object, Array],
    },
    setup(props) {
        const renderMark = () => {
            return <span style="padding-right: 8px">{isArray(props.value) ? '[]' : '{}' }</span>;
        };
        const length = computed(() => {
            return isArray(props.value) ? props.value.length : Object.keys(props.value).length;
        });
        return () => {
            return <span style="padding-left: 12px; color: #8c8c8c">
                {renderMark()}
                {length.value}
                <span style="padding-left: 8px">{isArray(props.value) ? 'items' : 'keys'}</span>
            </span>;
        };
    },
});
