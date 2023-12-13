import type { IPluginConfig } from '@webank/letgo-engine-plugin';
import { FTooltip } from '@fesjs/fes-design';
import Panel from './panel';

export default {
    name: 'PluginCodePanel',
    init({ skeleton, editor, designer }) {
        skeleton.add({
            area: 'leftArea',
            name: 'CodeWidget',
            type: 'Widget',
            render: () => (
                <FTooltip content="逻辑" placement="right">
                    <span class="letgo-plg-code__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                            <g fill="none">
                                <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092" />
                                <path fill="currentColor" d="M8 3a1 1 0 0 1 .117 1.993L8 5H7a1 1 0 0 0-.993.883L6 6v4c0 .768-.289 1.47-.764 2c.428.478.704 1.093.755 1.772L6 14v4a1 1 0 0 0 .883.993L7 19h1a1 1 0 0 1 .117 1.993L8 21H7a3 3 0 0 1-2.995-2.824L4 18v-4a1 1 0 0 0-.883-.993L3 13a1 1 0 0 1-.117-1.993L3 11a1 1 0 0 0 .993-.883L4 10V6a3 3 0 0 1 2.824-2.995L7 3zm9 0a3 3 0 0 1 2.995 2.824L20 6v4a1 1 0 0 0 .883.993L21 11a1 1 0 0 1 .117 1.993L21 13a1 1 0 0 0-.993.883L20 14v4a3 3 0 0 1-2.824 2.995L17 21h-1a1 1 0 0 1-.117-1.993L16 19h1a1 1 0 0 0 .993-.883L18 18v-4c0-.768.289-1.47.764-2a2.988 2.988 0 0 1-.755-1.772L18 10V6a1 1 0 0 0-.883-.993L17 5h-1a1 1 0 0 1-.117-1.993L16 3z" />
                            </g>
                        </svg>
                    </span>
                </FTooltip>
            ),
        }).link(
            skeleton.add({
                type: 'Panel',
                name: 'CodePanel',
                area: 'leftFloatArea',
                render: () => <Panel editor={editor} designer={designer} />,
                props: {
                    width: 720,
                    title: '逻辑',
                },
            }),
        );
    },
} as IPluginConfig;
