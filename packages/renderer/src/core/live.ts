import { Fragment, defineComponent, h } from 'vue';
import type { BlockScope } from '../utils';
import { useRendererContext } from '../context';
import {
    buildLoop,
    buildProps,
    buildSchema,
    buildShow,
    buildSlots,
    useLeaf,
} from './use';
import { leafProps } from './base';
import type { SlotSchemaMap } from './base';

export const Live = defineComponent({
    name: 'Live',
    props: leafProps,
    setup(props) {
        const { executeCtx } = useRendererContext();

        const { renderComp } = useLeaf(props, executeCtx);

        const { show } = buildShow(props.scope, executeCtx, props.schema);
        const { loop, loopArgs } = buildLoop(props.scope, props.schema);
        const { props: compProps, slots: compSlots } = buildSchema(props);
        const innerBuildSlots = (
            slots: SlotSchemaMap,
            blockScope?: BlockScope | null,
        ) => {
            return buildSlots(renderComp, slots, blockScope);
        };

        return {
            show,
            loop,
            loopArgs,
            compProps,
            compSlots,
            innerBuildSlots,
            executeCtx,
            renderComp,
        };
    },
    render() {
        const {
            show,
            comp,
            loop,
            loopArgs,
            compProps,
            compSlots,
            innerBuildSlots,
            scope,
            executeCtx,
            renderComp,
        } = this;

        if (!show)
            return null;

        if (!comp)
            return h('div', 'component not found');

        if (!loop) {
            return h(
                comp,
                buildProps({
                    context: executeCtx,
                    scope,
                    propsSchema: compProps,
                    render: renderComp,
                }),
                innerBuildSlots(compSlots),
            );
        }

        if (!Array.isArray(loop)) {
            console.warn('[vue-renderer]: loop must be array', loop);
            return null;
        }

        return h(
            Fragment,
            loop.map((item, index) => {
                const blockScope = {
                    [loopArgs[0]]: item,
                    [loopArgs[1]]: index,
                };
                return h(
                    comp,
                    buildProps({
                        context: executeCtx,
                        scope,
                        propsSchema: compProps,
                        blockScope,
                        render: renderComp,
                    }),
                    innerBuildSlots(compSlots, blockScope),
                );
            }),
        );
    },
});
