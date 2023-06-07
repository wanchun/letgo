import { isArray, isFunction, isPlainObject } from 'lodash-es';
import type { PropType } from 'vue';
import { defineComponent, ref } from 'vue';
import FadeInExpandTransition from '../fade-in-expand-transition';
import FillArrow from './fill-arrow';
import LeafNode from './leaf-node';
import LabelTip from './label-tip';
import { iconActiveCls, labelIconCls } from './tree-node.css';

const TreeNode = defineComponent({
    name: 'TreeNode',
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
            return <div onClick={toggleExpend} style={`padding-left: ${props.level * 14}px`}>
                <FillArrow class={[labelIconCls, expended.value && iconActiveCls]} />
                <span style="font-weight: 600">{props.label}</span>
                <LabelTip value={props.value} />
            </div>;
        };
        return () => {
            if (isArray(props.value) && props.value.length) {
                return <>
                    {renderLabel()}
                    <FadeInExpandTransition>
                        <div v-show={expended.value}>
                            {
                                Array.from(props.value.keys()).map((key) => {
                                    return <TreeNode label={key} level={props.level + 1} value={props.value[key]} />;
                                })
                            }
                        </div>
                    </FadeInExpandTransition>
                </>;
            }

            else if (isPlainObject(props.value)) {
                const keys = Object.keys(props.value).filter(key => !isFunction(props.value[key]));
                if (keys.length > 0) {
                    return <>
                        {renderLabel()}
                        <FadeInExpandTransition>
                            <div v-show={expended.value}>
                                {
                                    keys.map((key) => {
                                        return <TreeNode label={key} level={props.level + 1} value={props.value[key]} />;
                                    })
                                }
                            </div>
                        </FadeInExpandTransition>
                    </>;
                }
            }

            return <LeafNode label={props.label} level={props.level} value={props.value} />;
        };
    },
});

export default TreeNode;
