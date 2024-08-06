import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { FButton, FTooltip } from '@fesjs/fes-design';
import { Switch } from '@icon-park/vue-next';
import { editor } from '@webank/letgo-editor-core';
import { isArray, isNil } from 'lodash-es';
import type {
    IPublicTypeAssetsJson,
    IPublicTypeComponentDescription,
    IPublicTypePropsMap,
    IPublicTypeSnippet,
} from '@webank/letgo-types';
import { isComponentDescription } from '@webank/letgo-common';
import type { INode } from '../../../types';
import './switch.less';

interface Component {
    desc: IPublicTypeComponentDescription;
    snippet: IPublicTypeSnippet;
}

export default defineComponent({
    props: {
        node: Object as PropType<INode>,
    },
    setup(props) {
        const { node } = props;

        const assets: IPublicTypeAssetsJson = editor.get('assets');

        const meta = node.componentMeta.getMetadata();

        const comps: Component[] = [];
        assets.components.forEach((item) => {
            if (!isComponentDescription(item))
                return;
            if (item.devMode !== 'lowCode' && item.category === meta.category && item.group === meta.group && item.title !== meta.title && item.snippets?.length) {
                item.snippets.forEach((snippet) => {
                    comps.push({
                        desc: item,
                        snippet,
                    });
                });
            }
        });

        const handleSwitch = (comp: Component) => {
            const schema = comp.snippet.schema;
            const propsData = node.propsData;
            let addedPropsData: IPublicTypePropsMap = {};

            if (!isNil(propsData)) {
                if (isArray(propsData)) {
                    addedPropsData = propsData.reduce((previousValue, currentValue) => {
                        if (meta.props.some(prop => prop.name === currentValue.name))
                            previousValue[currentValue.name] = currentValue.value;

                        return previousValue;
                    }, {} as IPublicTypePropsMap);
                }
                else {
                    Object.keys(propsData).forEach((key) => {
                        if (meta.props.some(prop => prop.name === key))
                            addedPropsData[key] = propsData[key];
                    });
                }
            }

            schema.props = { ...schema.props, ...addedPropsData };

            const { document: doc, parent, index } = node;
            if (parent) {
                const newNode = doc.insertNode(
                    parent,
                    schema,
                    index + 1,
                    true,
                );
                doc.selection.select(newNode.id);
                node.remove();
            }
        };

        const renderIcon = (desc: IPublicTypeComponentDescription) => {
            return (
                desc.screenshot && (
                    <img
                        class="letgo-components__icon"
                        src={desc.screenshot}
                        draggable="false"
                    />
                )
            );
        };

        return () => {
            if (comps.length === 0)
                return;

            return (
                <div class="letgo-designer-sim__border-action">
                    <FTooltip
                        mode="popover"
                        v-slots={{
                            content: () => {
                                return (
                                    <div class="letgo-switch-popover">
                                        <div class="letgo-switch-popover__header">
                                            切换
                                            <span class="letgo-switch-popover__header-desc">（切换组件类型）</span>
                                        </div>
                                        <div class="letgo-switch-popover__body">
                                            {
                                             comps.map((comp) => {
                                                 return (
                                                     <FButton
                                                         class="letgo-switch-popover__body-item"
                                                         v-slots={{ icon: renderIcon(comp.desc) }}
                                                         onClick={() => handleSwitch(comp)}
                                                     >
                                                         {comp.desc.title}
                                                     </FButton>
                                                 );
                                             })
                                            }
                                        </div>
                                    </div>
                                );
                            },

                        }}
                    >
                        <Switch size={14} />
                    </FTooltip>

                </div>
            );
        };
    },
});
