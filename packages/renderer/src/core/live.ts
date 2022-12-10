import { defineComponent, Fragment, h } from 'vue';
import {
    useLeaf,
    buildSchema,
    buildProps,
    buildLoop,
    buildShow,
    buildSlots,
} from './use';
import { leafProps } from './base';
import type { BlockScope } from '../utils';
import type { SlotSchemaMap } from './use';

export const Live = defineComponent({
    name: 'Live',
    props: leafProps,
    setup(props) {
        const { renderComp } = useLeaf(props);

        const { show } = buildShow(props.scope, props.schema);
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
        } = this;

        if (!show) return null;
        if (!comp) return h('div', 'component not found');
        if (!loop) {
            return h(
                comp,
                buildProps(scope, compProps),
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
                    buildProps(scope, compProps, blockScope),
                    innerBuildSlots(compSlots, blockScope),
                );
            }),
        );
    },
});
