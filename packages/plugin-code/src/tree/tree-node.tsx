import { isArray } from 'lodash-es';
import type { PropType } from 'vue';
import { defineComponent, ref } from 'vue';
import FadeInExpandTransition from '../fade-in-expand-transition';
import FillArrow from '../fill-arrow';
import LeafNode from './leaf-node';
import LabelTip from './label-tip';

const TreeNode = defineComponent({
    props: {
        value: {
            type: [Array, Object, String, Number, Boolean] as PropType<any>,
        },
        label: [String, Number],
        level: Number,
    },
    setup(props) {
        const expended = ref(false);
        const toggleExpend = () => {
            expended.value = !expended.value;
        };
        const renderLabel = () => {
            return <span onClick={toggleExpend}>
                <FillArrow style={{ color: '#bfbfbf' }} />
                <span style="font-weight: 600">{props.label}</span>
                <LabelTip value={props.value} />
            </span>;
        };
        return () => {
            if (isArray(props.value) && props.value.length) {
                return <>
                    {renderLabel()}
                    <FadeInExpandTransition>
                        <div v-show={expended}>
                            {
                                Array.from(props.value.keys()).map((key) => {
                                    return <TreeNode label={key} level={props.level + 1} value={props.value[key]} />;
                                })
                            }
                        </div>
                    </FadeInExpandTransition>
                </>;
            }

            else if (typeof props.value === 'object' && Object.keys(props.value).length) {
                return <>
                    {renderLabel()}
                    <FadeInExpandTransition>
                        <div v-show={expended}>
                            {
                                Object.keys(props.value).map((key) => {
                                    return <TreeNode label={key} level={props.level + 1} value={props.value[key]} />;
                                })
                            }
                        </div>
                    </FadeInExpandTransition>
                </>;
            }

            return <LeafNode label={props.label} level={props.level} value={props.value} />;
        };
    },
});

export default TreeNode;
