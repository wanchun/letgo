import { createRequest } from '@qlin/request';

export const request = createRequest({
    mode: 'cors',
    credentials: 'same-origin',
    transformData: (res) => {
        return res.data;
    },
});
