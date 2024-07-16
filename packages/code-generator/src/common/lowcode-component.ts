import type { Context } from './types';

export const LOW_COMPONENT_DIR = 'components';

export function getLowComponentFilePath(ctx: Context, compName: string) {
    return `${ctx.config.letgoDir}/${LOW_COMPONENT_DIR}/${compName}`;
}
