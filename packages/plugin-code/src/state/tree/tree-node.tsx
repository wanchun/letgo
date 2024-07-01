import { isArray, isPlainObject } from 'lodash-es';
import type { PropType } from 'vue';
import { defineComponent, ref } from 'vue';
import FadeInExpandTransition from '../fade-in-expand-transition';
import FillArrow from './fill-arrow';
import LabelTip from './label-tip';
import LeafNode from './leaf-node';
import './tree-node.less';

const TreeNode = defineComponent({
    name: 'TreeNode',
    props: {
        value: {
            type: [Array, Object, String, Number, Boolean, Function] as PropType<any>,
        },
        label: [String, Number],
        level: Number,
    },
    setup(props) {
        const expended = ref(false);
        const toggleExpend = () => {
            expended.value = !expended.value;
        };
        const showAll = ref(false);
        const renderLabel = () => {
            return (
                <div
                    class="letgo-plg-code-tree__node"
                    onClick={toggleExpend}
                    style={`padding-left: ${props.level * 14}px`}
                >
                    <FillArrow class={['letgo-plg-code-tree__icon', expended.value && 'letgo-plg-code-tree__icon--active']} />
                    <span style="font-weight: 600">{props.label}</span>
                    <LabelTip value={props.value} />
                </div>
            );
        };

        const renderArray = () => {
            const children = [];
            const needMore = props.value.length > 3;
            const len = showAll.value ? props.value.length : (needMore ? 3 : props.value.length);
            for (let index = 0; index < len; index++)
                children.push(<TreeNode label={index} level={props.level + 1} value={props.value[index]} />);

            if (!showAll.value && needMore) {
                children.push(
                    <div
                        class="letgo-plg-code-tree__node"
                        onClick={() => showAll.value = true}
                        style={`padding-left: ${(props.level + 1) * 14}px`}
                    >
                        <FillArrow class={['letgo-plg-code-tree__icon', showAll.value && 'letgo-plg-code-tree__icon--active']} />
                        <span style="font-weight: 600">展示全部</span>
                    </div>,
                );
            }

            return (
                <>
                    {renderLabel()}
                    <FadeInExpandTransition>
                        <div v-show={expended.value}>
                            {children}
                        </div>
                    </FadeInExpandTransition>
                </>
            );
        };

        return () => {
            if (isArray(props.value) && props.value.length) {
                return renderArray();
            }
            else if (isPlainObject(props.value)) {
                return (
                    <>
                        {renderLabel()}
                        <FadeInExpandTransition>
                            <div v-show={expended.value}>
                                {
                                    Object.keys(props.value).filter(key => !key.startsWith('__')).map((key) => {
                                        return <TreeNode label={key} level={props.level + 1} value={props.value[key]} />;
                                    })
                                }
                            </div>
                        </FadeInExpandTransition>
                    </>
                );
            }

            return <LeafNode label={props.label} level={props.level} value={props.value} />;
        };
    },
});

export default TreeNode;
