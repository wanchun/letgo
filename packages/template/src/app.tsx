import { defineRuntimeConfig } from '@fesjs/fes';
import { FConfigProvider } from '@fesjs/fes-design';

export default defineRuntimeConfig({
    rootContainer(Container: any) {
        return () => {
            return (
                <FConfigProvider>
                    <Container />
                </FConfigProvider>
            );
        };
    },
});
