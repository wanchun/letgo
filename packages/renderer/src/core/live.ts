import { Fragment, defineComponent, h, toRef } from 'vue';
import type {
    IPublicTypeComponentInstance,
} from '@webank/letgo-types';
import type { BlockScope } from '../utils';
import { useRendererContext } from '../context';
import config from '../config';
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
        const { executeCtx, onCompGetCtx } = useRendererContext();

        const { renderComp } = useLeaf(toRef(props, 'scope'), executeCtx, props.schema.id);

        const { show } = buildShow(props.scope, executeCtx, props.schema);
        const { loop, loopArgs } = buildLoop(props.scope, executeCtx, props.schema);
        const { props: compProps, slots: compSlots } = buildSchema(props.schema);
        const innerBuildSlots = (
            slots: SlotSchemaMap,
            blockScope?: BlockScope | null,
        ) => {
            return buildSlots(renderComp, slots, blockScope);
        };

        const getRef = (inst: IPublicTypeComponentInstance) => {
            onCompGetCtx(props.schema, inst);
        };

        return {
            show,
            loop,
            loopArgs,
            compProps,
            compSlots,
            innerBuildSlots,
            executeCtx,
            getRef,
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
            getRef,
            innerBuildSlots,
            scope,
            executeCtx,
            renderComp,
            schema,
        } = this;

        if (!show)
            return null;

        if (!loop) {
            return h(
                comp,
                buildProps({
                    componentId: schema.id,
                    context: executeCtx,
                    scope,
                    propsSchema: compProps,
                    extraProps: { ref: getRef },
                    render: renderComp,
                }),
                innerBuildSlots(compSlots),
            );
        }

        if (!Array.isArray(loop)) {
            config.logWarn(`[vue-renderer]: loop must be array: ${JSON.stringify(loop)}`);
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
                        componentId: schema.id,
                        context: executeCtx,
                        scope,
                        propsSchema: compProps,
                        extraProps: { ref: getRef },
                        blockScope,
                        render: renderComp,
                    }),
                    innerBuildSlots(compSlots, blockScope),
                );
            }),
        );
    },
});
