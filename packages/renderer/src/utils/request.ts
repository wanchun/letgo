import { createRequest } from '@qlin/request';
import { isPlainObject } from 'lodash-es';

export const request = createRequest({
    mode: 'cors',
    credentials: 'same-origin',
    transformData: (res) => {
        if (isPlainObject(res))
            return res.data ? res.data : res;

        return res;
    },
});
