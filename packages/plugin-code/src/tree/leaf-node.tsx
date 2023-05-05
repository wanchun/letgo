import { defineComponent } from 'vue';

import { isArray, isBoolean, isNil, isNumber, isPlainObject, isString } from 'lodash-es';
import { leafCls, leafValueCls } from './leaf-node.css';
import LabelTip from './label-tip';

type CommonType = string | number | null | boolean;

export default defineComponent({
    props: {
        label: [String, Number],
        value: [Object, Array, String, Number, Boolean],
        level: {
            type: Number,
            default: 0,
        },
    },
    setup(props) {
        const renderEmptyObject = () => {
            return <LabelTip value={{}} />;
        };
        const renderEmptyArray = () => {
            return <LabelTip value={[]} />;
        };
        const attachColorToValue = (color: string, value: string | number) => {
            return <span class={leafValueCls} style={`color: ${color}`}>{value}</span>;
        };
        const renderCommonValue = (value: CommonType) => {
            if (isString(value))
                return attachColorToValue('#f759ab', `"${value}"`);

            else if (isNumber(value))
                return attachColorToValue('#73d13d', value);

            else if (isBoolean(value))
                return attachColorToValue('#ff7a45', JSON.stringify(value));

            else if (isNil(value))
                return attachColorToValue('#ffa940', 'null');
        };
        const renderValue = () => {
            if (isPlainObject(props.value))
                return renderEmptyObject();

            else if (isArray(props.value))
                return renderEmptyArray();

            return renderCommonValue(props.value as CommonType);
        };
        return () => {
            return <div class={leafCls} style={`padding-left: ${props.level * 14}px`}>
                <span>{props.label}</span>
                {renderValue()}
            </div>;
        };
    },
});
