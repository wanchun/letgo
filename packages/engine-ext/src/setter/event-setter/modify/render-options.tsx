import { ComponentEventAction } from '@webank/letgo-types/es/component-event';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { FInput, FOption, FSelect } from '@fesjs/fes-design';
import Label from './label';

export default defineComponent({
    props: {
        action: String as PropType<ComponentEventAction>,
    },
    setup(props) {
        const renderQuery = () => {
            return <>
                <Label label="Query">
                    <FSelect>

                    </FSelect>
                </Label>
                <Label label="Method">
                    <FSelect>
                        <FOption value="trigger">Trigger</FOption>
                        <FOption value="reset">Reset</FOption>
                        <FOption value="clearCache">Clear Cache</FOption>
                    </FSelect>
                </Label>
            </>;
        };

        const renderGoToURL = () => {
            return <Label label="URL">
                    <FInput />
                </Label>;
        };
        const renderGoToPage = () => {
            return <Label label="page">
                    <FSelect>

                    </FSelect>
                </Label>;
        };
        const renderSetTemporaryState = () => {
            return <>
                <Label label="State">
                    <FSelect>

                    </FSelect>
                </Label>
                <Label label="value">
                    <FInput />
                </Label>
            </>;
        };
        const renderSetLocalStorage = () => {
            return <>
                <Label label="Method">
                    <FSelect>
                        <FOption value="setValue">set Value</FOption>
                        <FOption value="clear">Clear</FOption>
                    </FSelect>
                </Label>
                <Label label="key">
                    <FInput />
                </Label>
                <Label label="value">
                    <FInput />
                </Label>
            </>;
        };
        return () => {
            if (props.action === ComponentEventAction.CONTROL_QUERY)
                return renderQuery();

            if (props.action === ComponentEventAction.CONTROL_COMPONENT)
                return renderGoToURL();

            if (props.action === ComponentEventAction.GO_TO_URL)
                return renderGoToURL();

            if (props.action === ComponentEventAction.GO_TO_PAGE)
                return renderGoToPage();

            if (props.action === ComponentEventAction.SET_TEMPORARY_STATE)
                return renderSetTemporaryState();

            if (props.action === ComponentEventAction.SET_LOCAL_STORAGE)
                return renderSetLocalStorage();
        };
    },
});
