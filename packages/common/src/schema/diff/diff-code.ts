import diff from 'simple-diff';
import type { ICodeItemWithDirectory } from '../code';

export function diffCode(baseCodeMap: Map<string, ICodeItemWithDirectory>, targetCodeMap: Map<string, ICodeItemWithDirectory>) {
    const baseCode = Array.from(baseCodeMap, ([_, value]) => value);
    const targetCode = Array.from(targetCodeMap, ([_, value]) => value);

    return diff(baseCode, targetCode, {
        idProp: 'key',
        idProps: {
            successEvent: 'id',
            failureEvent: 'id',
        },
    });
}
