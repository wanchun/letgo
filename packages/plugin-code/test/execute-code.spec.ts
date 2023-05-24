import { assert, describe, it } from 'vitest';
import { getCodeInstance } from '../src/code/code-impl/code-impl';
import type { CodeItem } from '../src/interface';
import { TEMPORARY_STATE } from '../src/constants';

const codeMap = new Map<string, CodeItem>();
codeMap.set('state1', {
    id: 'state1',
    type: TEMPORARY_STATE,
    initValue: '1',
});
codeMap.set('state2', {
    id: 'state2',
    type: TEMPORARY_STATE,
    initValue: '{{state1.value + 1}}',
});

// All tests within this suite will be run in parallel
describe('temporary state init', () => {
    const codeInstances = getCodeInstance(codeMap);
    it('test', () => {
        // Suite skipped, no error
        assert.equal(codeInstances.state1.value, 1);
        assert.equal(codeInstances.state2.value, 2);
    });
});
